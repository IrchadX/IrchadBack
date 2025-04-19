import * as _pdfMake from 'pdfmake/build/pdfmake';
import * as _pdfFonts from 'pdfmake/build/vfs_fonts';

const pdfMake: any = _pdfMake;
pdfMake.vfs = _pdfFonts as any 

export default pdfMake;
