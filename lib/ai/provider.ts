export interface TimetableScannerProvider {
  extract(file: File): Promise<unknown>;
}
