# One-off asset generator for Etapa 5 (identidade visual: icon sizes + splash).
# Not part of the build — run manually whenever the source icon changes.
# Requires no new dependencies (sharp isn't installed in this workspace);
# uses System.Drawing, available on any Windows PowerShell.

Add-Type -AssemblyName System.Drawing

$assets = "C:\Users\ander\OneDrive\Desktop\Controle Financeiro\mobile\assets"
$srcPath = Join-Path $assets "icon-divisa-final.png"

function New-TransparentCanvas([int]$size) {
    $bmp = New-Object System.Drawing.Bitmap $size, $size, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.Clear([System.Drawing.Color]::Transparent)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    return @($bmp, $g)
}

# --- 1. Isolate the white line-art mark onto a transparent canvas ---------
# The mark is pure white (R=G=B=255); the sunset-gradient background never
# gets that light (min channel stays well under 150 in every sampled spot).
# Using min(R,G,B) as a luminance proxy gives clean anti-aliased edges
# instead of a jagged hard-threshold cutout.
$src = [System.Drawing.Bitmap]::FromFile($srcPath)
$w = $src.Width
$h = $src.Height
$markSrc = New-Object System.Drawing.Bitmap $w, $h, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)

$srcRect = New-Object System.Drawing.Rectangle 0, 0, $w, $h
$srcData = $src.LockBits($srcRect, [System.Drawing.Imaging.ImageLockMode]::ReadOnly, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$dstData = $markSrc.LockBits($srcRect, [System.Drawing.Imaging.ImageLockMode]::WriteOnly, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)

$bytes = $w * $h * 4
$buffer = New-Object byte[] $bytes
[System.Runtime.InteropServices.Marshal]::Copy($srcData.Scan0, $buffer, 0, $bytes)

$lowT = 150
$highT = 230
for ($i = 0; $i -lt $bytes; $i += 4) {
    $b = $buffer[$i]; $gC = $buffer[$i + 1]; $r = $buffer[$i + 2]; $a = $buffer[$i + 3]
    $minCh = [Math]::Min($r, [Math]::Min($gC, $b))
    $whiteness = [Math]::Max(0, [Math]::Min(1, ($minCh - $lowT) / ($highT - $lowT)))
    $newA = [byte]([Math]::Round($a * $whiteness))
    $buffer[$i] = 255; $buffer[$i + 1] = 255; $buffer[$i + 2] = 255; $buffer[$i + 3] = $newA
}

[System.Runtime.InteropServices.Marshal]::Copy($buffer, 0, $dstData.Scan0, $bytes)
$src.UnlockBits($srcData)
$markSrc.UnlockBits($dstData)
$src.Dispose()

# --- 2. Pad the isolated mark onto a 1024x1024 transparent canvas, sized
#        to Android's adaptive-icon "safe zone" (~66% of the canvas) -------
$canvasSize = 1024
$markSize = [int]($canvasSize * 0.58)
$offset = [int](($canvasSize - $markSize) / 2)

$fg = New-TransparentCanvas $canvasSize
$fgBmp = $fg[0]; $fgG = $fg[1]
$fgG.DrawImage($markSrc, $offset, $offset, $markSize, $markSize)
$fgG.Dispose()
$fgBmp.Save((Join-Path $assets "adaptive-icon-foreground.png"), [System.Drawing.Imaging.ImageFormat]::Png)
$fgBmp.Dispose()

# --- 3. Same mark-on-transparent asset, reused as the splash image --------
# (expo-splash-screen's resizeMode:contain centers it on backgroundColor,
# so the same "mark with breathing room" asset works for both purposes.)
Copy-Item (Join-Path $assets "adaptive-icon-foreground.png") (Join-Path $assets "splash-icon-divisa.png") -Force

$markSrc.Dispose()

# --- 4. Regenerate the main icon at the platform-recommended 1024x1024 ----
# (Same artwork, no redesign — just a correctly-sized source. The current
# icon-divisa-final.png is 554x554; App Store/EAS want a 1024 source.)
$srcForUpscale = [System.Drawing.Bitmap]::FromFile($srcPath)
$big = New-Object System.Drawing.Bitmap $canvasSize, $canvasSize, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$bigG = [System.Drawing.Graphics]::FromImage($big)
$bigG.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$bigG.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$bigG.DrawImage($srcForUpscale, 0, 0, $canvasSize, $canvasSize)
$bigG.Dispose()
$big.Save((Join-Path $assets "icon-divisa-1024.png"), [System.Drawing.Imaging.ImageFormat]::Png)
$big.Dispose()
$srcForUpscale.Dispose()

# --- 5. Web favicon at a normal favicon resolution ------------------------
$favSize = 196
$fav = New-Object System.Drawing.Bitmap $favSize, $favSize, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$favG = [System.Drawing.Graphics]::FromImage($fav)
$favG.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$favG.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$favSrc = [System.Drawing.Bitmap]::FromFile((Join-Path $assets "icon-divisa-1024.png"))
$favG.DrawImage($favSrc, 0, 0, $favSize, $favSize)
$favG.Dispose()
$fav.Save((Join-Path $assets "favicon-divisa.png"), [System.Drawing.Imaging.ImageFormat]::Png)
$fav.Dispose(); $favSrc.Dispose()

Write-Output "Done: adaptive-icon-foreground.png, splash-icon-divisa.png, icon-divisa-1024.png, favicon-divisa.png"