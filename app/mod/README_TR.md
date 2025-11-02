# CasaMOD Katkı Rehberi

CasaMOD'a yaratıcılığınızı ve kodunuzu katkıda bulunmaya hoş geldiniz! Kod kalitesini ve tutarlılığı sağlamak için lütfen bu yönergeleri takip edin:

## Yapı

Örnek:

```
my-awesome-mod/
├── mod.js
├── mod.css
└── img
    └── image.jpg
```

Her MOD ayrı bir klasöre yerleştirilmelidir ve klasör adı şu kuralları takip etmelidir:

* Küçük harf: Tüm harfler küçük olmalıdır.
* Boşlukları - ile değiştirin: Klasör adındaki boşluklar tire `-` ile değiştirilmelidir.
* Örnek: `my-awesome-mod`

MOD klasörü aşağıdaki yapı ile organize edilmelidir:
  * **mod.js** MOD'un ana JavaScript dosyası, MOD'un mantığını ve işlevlerini içerir.
  * **mod.css** MOD'un stil sayfası, MOD'un öğelerinin görsel görünümünü ve düzenini tanımlar.
  * **/img** Alt dizin diğer kaynak dosyaları saklamak için, örneğin resimler.

## mod.js

`mod.js` dosyası MOD'un giriş noktasıdır. DOM işlemlerini gerçekleştirmeden önce Vue render'ının tamamlanmasını bekleyin. Örnek:

```javascript
alert("Merhaba Dünya!")
```

CasaMOD'a katkınız için teşekkür ederiz!
