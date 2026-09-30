// Metro resolves bundled media files to numeric asset module ids.
declare module '*.mp3' {
  const assetId: number;
  export default assetId;
}
