<?php
$page = "home";
$title = "Нарлаг — Зуслангийн зүлэг, мод, багаж";
$desc = "Зуслангийн зүлэг тэгшлэх, мод засах, багаж хэрэгсэл түрээслэх болон худалдах үйлчилгээ.";
require __DIR__ . "/partials/header.php";
?>
<section class="hero">
  <div class="hero__sun" aria-hidden="true"></div>
  <div class="wrap hero__grid">
    <div>
      <p class="eyebrow">Зуслангийн улирал</p>
      <h1>Зүлгийг тэгшилж, модыг засаад, <em>зуныхаа өдрийг</em> амар өнгөрүүл</h1>
      <p class="hero__lead">Хашаандаа ирж зүлэг хадаж тэгшилнэ, мөчир тайрна. Хэрэгтэй багажаа өдрөөр түрээслэж, эсвэл худалдаж авч болно.</p>
      <div class="hero__actions">
        <a class="btn btn--sun" href="zahialga.php">Үйлчилгээ захиалах</a>
        <a class="btn btn--ghost" href="tuurees.php">Багаж үзэх</a>
      </div>
      <ul class="chips">
        <li><a href="zuileg.php">Зүлэг тэгшлэх</a></li>
        <li><a href="mod.php">Мод засах</a></li>
        <li><a href="tuurees.php">Багаж түрээс</a></li>
        <li><a href="hudaldah.php">Багаж худалдаа</a></li>
      </ul>
    </div>
    <div class="hero__visual">
      <div class="hero__frame">
        <img src="assets/img/lawn.jpg" alt="Нар туссан, тэгш ногоон зүлэг">
      </div>
      <div class="hero__card">
        <strong>08:00–19:00</strong>
        <span>Өдөр бүр, зуслангийн бүсэд ирнэ</span>
      </div>
    </div>
  </div>
  <svg class="hero__grass" viewBox="0 0 1440 90" preserveAspectRatio="none" aria-hidden="true">
    <path fill="#f6f0e4" d="M0 52c140-36 220 24 360 12 150-14 190-46 340-32 160 14 230 42 360 22 120-18 210-8 380 16v30H0V52z"/>
  </svg>
</section>

<div class="tape-clip" aria-hidden="true">
  <div class="tape">
    <div class="tape__track">
      <span>Зүлэг тэгшлэх</span><i></i>
      <span>Мод засах</span><i></i>
      <span>Багаж түрээс</span><i></i>
      <span>Багаж худалдаа</span><i></i>
      <span>Хашаандаа ирнэ</span><i></i>
      <span>Зуны өдөр</span><i></i>
      <span>Зүлэг тэгшлэх</span><i></i>
      <span>Мод засах</span><i></i>
      <span>Багаж түрээс</span><i></i>
      <span>Багаж худалдаа</span><i></i>
      <span>Хашаандаа ирнэ</span><i></i>
      <span>Зуны өдөр</span><i></i>
    </div>
  </div>
</div>

<section class="stats">
  <div class="wrap stats__grid">
    <p class="stat"><strong>24 цаг</strong><span>дотор холбогдож цаг товлоно</span></p>
    <p class="stat"><strong>5–9 сар</strong><span>зүлэгний үндсэн улирал</span></p>
    <p class="stat"><strong>4–10 сар</strong><span>мод тайрах улирал</span></p>
    <p class="stat"><strong>1 өдөр</strong><span>багаж авч, орой буцаана</span></p>
  </div>
</section>

<section class="section" id="uilchilgee">
  <div class="wrap">
    <header class="section-head">
      <p class="eyebrow">Үйлдэл</p>
      <h2>Юу хийхээ сонгоно уу</h2>
      <p class="lede">Үйлдэл бүр өөрийн хуудсан дээрээ. Зүлэг, мод, түрээс, худалдаа тусдаа.</p>
    </header>
    <div class="actions">
      <a class="action" href="zuileg.php">
        <strong>01</strong>
        <h3>Зүлэг тэгшлэх</h3>
        <p>Хадаж, ирмэг гаргаж, өвсийг хураана.</p>
      </a>
      <a class="action" href="mod.php">
        <strong>02</strong>
        <h3>Мод засах</h3>
        <p>Хуурай мөчир тайрч, хэлбэрийг нь янзална.</p>
      </a>
      <a class="action" href="tuurees.php">
        <strong>03</strong>
        <h3>Багаж түрээс</h3>
        <p>Өглөө авч, орой буцаана. 7 хоногоос хямд.</p>
      </a>
      <a class="action" href="hudaldah.php">
        <strong>04</strong>
        <h3>Багаж худалдаа</h3>
        <p>Хадагч, хөрөө, триммерийг өөрийнх болгоно.</p>
      </a>
    </div>
  </div>
</section>

<section class="banner">
  <img src="assets/img/meadow.jpg" alt="">
  <div class="banner__shade"></div>
  <blockquote>Зуны өдөр тэгш зүлэг, цэвэр мөчиртэй модноос эхэлдэг.</blockquote>
</section>

<section class="section" style="padding-top:0">
  <div class="wrap">
    <header class="section-head">
      <p class="eyebrow">Явц</p>
      <h2>Захиалгаас цэвэр хашаа хүртэл</h2>
    </header>
    <ol class="steps">
      <li><span>01</span><h3>Захиалга</h3><p>Өдөр, бүс, талбайгаа үлдээнэ. Багажаа сагслана.</p></li>
      <li><span>02</span><h3>Баталгаа</h3><p>24 цагийн дотор утсаар үнэ, цагийг тохирно.</p></li>
      <li><span>03</span><h3>Ажил</h3><p>Зүлэг тэгшилж, мод тайрч, багажаа хүлээлгэнэ.</p></li>
      <li><span>04</span><h3>Цэвэрлэгээ</h3><p>Өвс, мөчрийг хурааж, хашааг цэвэр үлдээнэ.</p></li>
    </ol>
  </div>
</section>

<section class="section" style="padding-top:10px">
  <div class="wrap">
    <header class="section-head">
      <p class="eyebrow">Бүс</p>
      <h2>Хаашаа явдаг вэ</h2>
      <p class="lede">Улаанбаатар орчмын зуслан. Өөр дүүрэг байвал захиалга дээр «Бусад» гэж сонгоод утсаар тохирно.</p>
    </header>
    <ul class="areas">
      <li>Шадивлан</li>
      <li>Жаргалант</li>
      <li>Хандгайт</li>
      <li>Хуурай мухар</li>
      <li>Яргайт</li>
      <li>Гачуурт</li>
      <li>Налайх</li>
      <li>Тэрэлж</li>
    </ul>
  </div>
</section>

<section class="cta">
  <div class="wrap cta__box">
    <img src="assets/img/cottage.jpg" alt="Нартай зуслангийн байшин">
    <div class="cta__copy">
      <p class="eyebrow">Энэ амралт</p>
      <h2>Зүлэг, мод, багажаа нэг дор захиал</h2>
      <p>Очих өдөр, талбай, сагсалсан багажаа үлдээгээрэй. Бид залгаж цагийг батална.</p>
      <div class="hero__actions">
        <a class="btn btn--sun" href="zahialga.php">Захиалга өгөх</a>
        <a class="btn btn--ghost" href="tel:+97699112244">9911-2244</a>
      </div>
    </div>
  </div>
</section>
<?php require __DIR__ . "/partials/footer.php"; ?>
