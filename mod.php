<?php
$page = "tree";
$title = "Мод засах — Зуслан зүлэг сервис";
$desc = "Зуслангийн мод тайрах, хуурай мөчир авах, хэлбэржүүлэх үйлчилгээ.";
require __DIR__ . "/partials/header.php";
?>
<section class="page-hero">
  <div class="wrap">
    <p class="eyebrow">Мод</p>
    <h1>Мод засах</h1>
    <p>Гэрэл, зам, дээвэр рүү орсон мөчир, хуурай салбарыг аюулгүй тайрна. Жимсний модыг хэлбэржүүлнэ.</p>
  </div>
</section>
<section class="section">
  <div class="wrap">
    <article class="feature">
      <figure class="feature__photo">
        <img src="assets/img/trees.jpg" alt="Нар туссан модны навчис">
        <figcaption>Хуурай, саад болсон мөчрийг тайрч цэвэрлэнэ</figcaption>
      </figure>
      <div>
        <h2>Юу хийдэг вэ</h2>
        <ul class="ticks">
          <li>Хуурай, өвчтэй мөчир авна</li>
          <li>Өндөр, хэлбэрийг тохируулна</li>
          <li>Жимсний мод тайрна</li>
          <li>Тайрдасыг зөөнө, цэвэрлэж хүлээлгэнэ</li>
        </ul>
        <p>Жижиг мод 40,000₮, дунд 80,000₮, том мод 150,000₮-өөс. Томыг ирж үзээд нарийвчилна.</p>
        <div class="hero__actions">
          <a class="btn btn--leaf" href="zahialga.php">Мод захиалах</a>
          <a class="btn btn--line" href="une.php">Үнэ харах</a>
        </div>
      </div>
    </article>
  </div>
</section>
<?php require __DIR__ . "/partials/footer.php"; ?>
