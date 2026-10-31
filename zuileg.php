<?php
$page = "lawn";
$title = "Зүлэг тэгшлэх — Зуслан зүлэг сервис";
$desc = "Зуслангийн зүлэг хадаж тэгшлэх, ирмэг гаргах, өвс хураах үйлчилгээ.";
require __DIR__ . "/partials/header.php";
?>
<section class="page-hero">
  <div class="wrap">
    <p class="eyebrow">Зүлэг</p>
    <h1>Зүлэг тэгшлэх</h1>
    <p>Өндөр өвс, хог ургамал, тэгш бус ирмэгийг цэвэрлэж, зуслангийн талбайг нээлттэй ногоон болгоно.</p>
  </div>
</section>
<section class="section">
  <div class="wrap">
    <article class="feature">
      <figure class="feature__photo">
        <img src="assets/img/garden.jpg" alt="Зах нь жигд, хадсан ногоон зүлэг">
        <figcaption>Хадаж, ирмэгийг нь гаргаад, хогийг нь хураана</figcaption>
      </figure>
      <div>
        <h2>Юу хийдэг вэ</h2>
        <ul class="ticks">
          <li>Хадаж, өндрийг нь жигдэлнэ</li>
          <li>Зам, цэцгийн хүрээний ирмэг гаргана</li>
          <li>Модны ёроол, хашааны хажууг триммердэнэ</li>
          <li>Хадсан өвсийг хурааж нэг дор гаргана</li>
        </ul>
        <p>1 м² нь 300–500₮. Хашааны хэмжээг оруулахад урьдчилсан дүн гарна. Бодит үнийг очиж хэмжсэний дараа хэлнэ.</p>
        <div class="hero__actions">
          <a class="btn btn--leaf" href="zahialga.php">Зүлэг захиалах</a>
          <a class="btn btn--line" href="une.php">Үнэ харах</a>
        </div>
      </div>
    </article>
  </div>
</section>
<?php require __DIR__ . "/partials/footer.php"; ?>
