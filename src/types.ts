export interface FeatishConfig {
  /** Target directory relative to cwd (default: "src/features") */
  dir: string;
  /** Folders to create inside each feature */
  folders: string[];
  /** Whether to generate barrel index.ts files */
  barrels: boolean;
  /** Whether to generate a README.md */
  readme: boolean;
}

export const DEFAULT_CONFIG: FeatishConfig = {
  dir: 'src/features',
  folders: ['components', 'hooks', 'services', 'stores', 'types', 'utils', 'constants'],
  barrels: true,
  readme: true,
};

export interface FeatureFile {
  path: string;
  content: string;
}
