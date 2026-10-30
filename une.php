<?php
$page = "price";
$title = "Үнэ — Нарлаг";
$desc = "Зүлэг тэгшлэх, мод засах үйлчилгээний ойролцоо үнэ.";
require __DIR__ . "/partials/header.php";
?>
<section class="page-hero">
  <div class="wrap">
    <p class="eyebrow">Үнэ</p>
    <h1>Ойролцоо дүнгээ энд харна</h1>
    <p>100 м² хүртэл зүлэг нэг үнэтэй. Түүнээс өргөн талбай, өндөр мод дээр нэмэгдэнэ. Ирж үзээд эцсийн үнээ хэлнэ.</p>
  </div>
</section>
<section class="section">
  <div class="wrap">
    <form class="estimate" id="estimator">
      <div class="estimate__fields">
        <div class="fields">
          <label class="field">Зүлэг, м²
            <input type="number" name="lawn" min="0" max="20000" value="120" inputmode="numeric">
          </label>
          <label class="field">Жижиг мод, 3 м хүртэл
            <input type="number" name="small" min="0" max="100" value="0" inputmode="numeric">
          </label>
          <label class="field">Дунд мод, 3–6 м
            <input type="number" name="mid" min="0" max="100" value="0" inputmode="numeric">
          </label>
          <label class="field">Том мод, 6 м-ээс дээш
            <input type="number" name="large" min="0" max="100" value="0" inputmode="numeric">
          </label>
        </div>
        <label class="check"><input type="checkbox" name="edge"> Ирмэг засах, 25,000₮</label>
      </div>
      <div class="estimate__result">
        <p class="eyebrow">Жишээ тооцоо</p>
        <strong id="est-total">0₮</strong>
        <p id="est-parts"></p>
        <a class="btn btn--sun" id="est-link" href="zahialga.php">Энэ тоогоор захиалах</a>
      </div>
    </form>
    <div class="price-grid" style="margin-top:22px">
      <article class="price-card">
        <h3>Зүлэг</h3>
        <ul>
          <li>100 м² хүртэл — 80,000₮</li>
          <li>100–300 м² — нэмэлт м² тутамд 700₮</li>
          <li>300 м²-ээс дээш — нэмэлт м² тутамд 500₮</li>
          <li>Ирмэг засах — 25,000₮</li>
        </ul>
        <a class="btn btn--line" href="zuileg.php">Зүлэгний хуудас</a>
      </article>
      <article class="price-card">
        <h3>Мод</h3>
        <ul>
          <li>Жижиг, 3 м хүртэл — 40,000₮</li>
          <li>Дунд, 3–6 м — 80,000₮</li>
          <li>Том, 6 м-ээс өндөр — 150,000₮-өөс</li>
          <li>Том модыг ирж үзээд нарийвчилна</li>
        </ul>
        <a class="btn btn--line" href="mod.php">Модны хуудас</a>
      </article>
    </div>
    <div class="faq" style="margin-top:36px">
      <div class="faq__item is-open">
        <h3><button type="button" aria-expanded="true">Үнэ яг ингэж гарах уу?<i aria-hidden="true"></i></button></h3>
        <div class="faq__panel"><p>Тооцоолуур ойролцоо дүн гаргана. Налуу, чулуу, маш өндөр мод байвал ирж үзээд хэлнэ. Үнийг ажил эхлэхээс өмнө тохирно.</p></div>
      </div>
      <div class="faq__item">
        <h3><button type="button" aria-expanded="false">Бороотой өдөр яах вэ?<i aria-hidden="true"></i></button></h3>
        <div class="faq__panel"><p>Хүчтэй бороонд зүлэг хадахгүй, өдрийг шилжүүлнэ. Мод тайрах ажлыг аюулгүй үед хийнэ.</p></div>
      </div>
      <div class="faq__item">
        <h3><button type="button" aria-expanded="false">Хог үлдээх үү?<i aria-hidden="true"></i></button></h3>
        <div class="faq__panel"><p>Үгүй. Хадсан өвс, тайрсан мөчрийг хурааж нэг дор гаргана. Хотоос гаргаж тээвэрлэх бол урьдчилан хэлнэ үү.</p></div>
      </div>
    </div>
  </div>
</section>
<?php require __DIR__ . "/partials/footer.php"; ?>
