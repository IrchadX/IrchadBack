import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  rootDir: '../', // Points to project root
  moduleFileExtensions: ['js', 'json', 'ts'],
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  testEnvironment: 'node',
};
export default config;
