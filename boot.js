(function () {
  var failed = false;
  function fail(message) {
    if (window.metReady || failed) return;
    failed = true;
    var root = document.getElementById('app');
    root.innerHTML = '<section class="startup-error"><h1>برنامه کامل بارگذاری نشد</h1><p id="boot-detail"></p><p>فایل ZIP را استخراج و همهٔ محتویات را در ریشهٔ مخزن آپلود کنید. سپس از Settings → Pages آدرس سایت منتشرشده را باز کنید، نه صفحهٔ فایل در مخزن. برای نسخهٔ قبلی، همهٔ پنجره‌های برنامه را ببندید و آدرس سایت را با ?v=9 باز کنید. داده‌های مرورگر را پاک نکنید.</p><button class="button" id="boot-retry">تلاش دوباره</button><a class="button" href="./guide.html">راهنمای انتشار</a></section>';
    document.getElementById('boot-detail').textContent = message;
    document.getElementById('boot-retry').onclick = function () { location.reload(); };
  }
  window.addEventListener('error', function (event) { fail('خطای اجرای برنامه: ' + (event.message || 'فایل بارگذاری نشد.')); });
  window.addEventListener('unhandledrejection', function () { fail('راه‌اندازی کامل نشد. نسخهٔ مرورگر و دسترسی به حافظهٔ سایت را بررسی کنید.'); });
  var script = document.createElement('script');
  script.src = './app.bundle.js?v=9';
  script.onerror = function () { fail('فایل app.bundle.js پیدا نشد یا شبکه مانع دریافت آن شد.'); };
  document.body.appendChild(script);
  setTimeout(function () { fail('راه‌اندازی بیش از حد طول کشید. اتصال اینترنت و مجوز ذخیره‌سازی را بررسی کنید.'); }, 15000);
}());
