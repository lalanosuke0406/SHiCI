$ErrorActionPreference = 'Stop'
$sourceRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '../..'))
$archivePath = Join-Path (Split-Path $sourceRoot -Parent) 'SHiCI-free-inapp-local.zip'
if (Test-Path -LiteralPath $archivePath) { throw 'Archive already exists. Keep the previous deliverable or choose another filename.' }
$assetRoot = Join-Path $sourceRoot 'frontend/private/assets'
$assets = @(Get-ChildItem -LiteralPath $assetRoot -File)
$reachable = [Collections.Generic.HashSet[string]]::new([StringComparer]::OrdinalIgnoreCase)
$queue = [Collections.Generic.Queue[string]]::new()
$queue.Enqueue((Join-Path $sourceRoot 'frontend/private/client.js'))
$queue.Enqueue((Join-Path $sourceRoot 'frontend/private/free-client.js'))
while ($queue.Count -gt 0) {
  $file = $queue.Dequeue()
  $content = [IO.File]::ReadAllText($file)
  foreach ($asset in $assets) {
    if ($content.Contains($asset.Name) -and $reachable.Add($asset.FullName)) { $queue.Enqueue($asset.FullName) }
  }
}
$skip = @('node_modules','generated','.wrangler','.git','.browsers','evidence','backups','runtime','test-results','playwright-report')
function Get-PackageFiles([string] $directory) {
  foreach ($item in Get-ChildItem -LiteralPath $directory -Force) {
    if ($item.PSIsContainer) {
      if ($skip -notcontains $item.Name) { Get-PackageFiles $item.FullName }
    } elseif ($item.Name -notlike '.env*' -and $item.Name -notlike '.dev.vars*' -and
              $item.Name -ne '.clasp.json' -and $item.Extension -notin @('.log','.zip','.db','.sqlite','.sqlite3','.pem','.key')) {
      if ($item.DirectoryName -eq $assetRoot -and -not $reachable.Contains($item.FullName)) { continue }
      $item
    }
  }
}
Add-Type -AssemblyName System.IO.Compression
$files = @(Get-PackageFiles $sourceRoot)
$archive = [IO.Compression.ZipFile]::Open($archivePath,[IO.Compression.ZipArchiveMode]::Create)
try {
  foreach ($file in $files) {
    $relative = [IO.Path]::GetRelativePath($sourceRoot,$file.FullName).Replace('\','/')
    [IO.Compression.ZipFileExtensions]::CreateEntryFromFile($archive,$file.FullName,'SHiCI/'+$relative,[IO.Compression.CompressionLevel]::Optimal) | Out-Null
  }
} finally { $archive.Dispose() }
$inspection = [IO.Compression.ZipFile]::OpenRead($archivePath)
try {
  if ($inspection.Entries.FullName -match '/(node_modules|generated|\.wrangler)/|/\.env|/\.dev\.vars|/\.clasp\.json$') { throw 'Excluded material detected.' }
  Write-Output ('Packaged {0} files; {1} active SDK assets; {2}' -f $inspection.Entries.Count,$reachable.Count,$archivePath)
} finally { $inspection.Dispose() }
