import sys
import pandas as pd
from sklearn.linear_model import LinearRegression
from datetime import datetime
from dateutil.relativedelta import relativedelta
import numpy as np
import json

# Vérifier la présence du chemin
if len(sys.argv) < 2:
    print(json.dumps({"error": "Chemin vers le fichier CSV requis"}), file=sys.stderr)
    sys.exit(1)

csv_path = sys.argv[1]

try:
    df = pd.read_csv(csv_path, sep=';')

    # Conversion des mois français -> anglais
    french_to_english_months = {
        'Janv': 'Jan', 'Fev': 'Feb', 'Mars': 'Mar', 'Avr': 'Apr', 'Mai': 'May',
        'Juin': 'Jun', 'Juil': 'Jul', 'Aout': 'Aug', 'Sept': 'Sep',
        'Oct': 'Oct', 'Nov': 'Nov', 'Dec': 'Dec'
    }

    def convert_french_month(mois_str):
        parts = mois_str.strip().split(' ')
        if len(parts) != 2:
            raise ValueError(f"Format invalide pour la date: {mois_str}")
        fr_month, year = parts
        en_month = french_to_english_months.get(fr_month, fr_month)
        return datetime.strptime(f"{en_month} {year} 1", "%b %Y %d")

    df['Date'] = df['Mois'].apply(convert_french_month)
    df = df.sort_values('Date')
    df['month_index'] = np.arange(len(df))

    X = df[['month_index', 'Nombre d\'alertes', 'Nombre de pannes']]
    y = df['Nombre de ventes']

    model = LinearRegression()
    model.fit(X, y)

    last_index = df['month_index'].iloc[-1]
    last_date = df['Date'].iloc[-1]

    # Créer les dates des mois restants de l’année
    current = datetime.now()
    future_dates = []

    date_ptr = datetime(current.year, current.month, 1)
    while date_ptr.year == current.year:
        if date_ptr > last_date:
            future_dates.append(date_ptr)
        date_ptr += relativedelta(months=1)

    # Construire les données d’entrée futures
    future_X = pd.DataFrame({
        'month_index': [last_index + i + 1 for i in range(len(future_dates))],
        'Nombre d\'alertes': [df['Nombre d\'alertes'].mean()] * len(future_dates),
        'Nombre de pannes': [df['Nombre de pannes'].mean()] * len(future_dates),
    })

    predictions = model.predict(future_X)

    # Résultat
    result = []
    for date, pred in zip(future_dates, predictions):
        mois = date.strftime('%b %Y')  # Ex: "Juil 2025"
        result.append({
            "mois": mois,
            "ventes_prevues": int(round(pred))
        })

    print(json.dumps(result, ensure_ascii=False))

except Exception as e:
    print(json.dumps({"error": str(e)}), file=sys.stderr)
    sys.exit(1)
