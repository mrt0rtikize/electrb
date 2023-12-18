pkgname=electrb
pkgver=0.1.0
pkgrel=1
arch=('x86_64')
url="http://github.com/mrt0rtikize/electrb"
license=('MIT')
depends=()
source=("$url/releases/download/$pkgver/$pkgname-$pkgver.pacman")
sha256sums=('a690b4385dcefb1957166ee43675d1e1fafc7960df45d1afa362a032ad226743')

package() {
	install -dm755 "$pkgdir/usr/lib/$pkgname"
	bsdtar -xpf "$srcdir/$pkgname-$pkgver.pacman" -C "$pkgdir/usr/lib/$pkgname"
	# FIXME: this line with `rm` should be removed
	# idk why but without it there is a warning shown during installation process
	# for now i believe it is ok, but generally it is shit
	rm "$pkgdir/usr/lib/$pkgname/.MTREE"

	install -dm755 "$pkgdir/usr/bin"
	ln -s "../lib/$pkgname/opt/electrb/electrb" "$pkgdir/usr/bin/electrb"
}
