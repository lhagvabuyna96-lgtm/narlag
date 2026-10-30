# Нарлаг

Зуслангийн зүлэг тэгшлэх, мод засах, багаж түрээс ба худалдааны сайт. Захиалга, нэвтрэлт Neon Postgres дээр, сервер Render дээр ажиллана.

## Эрх

- **Захиалагч** `/burtgel` дээр өөрөө бүртгүүлж, захиалга илгээж, `/zahialguud` дээр зөвхөн өөрийн захиалгыг харна.
- **Админ** зөвхөн `ADMIN_EMAIL` ба `ADMIN_PASSWORD`-оор анхны асаалтад үүснэ. `/admin` дээр бүх захиалгыг харж төлөв өөрчилнө. Эрхийг маягтаас авахгүй.

## Орчны хувьсагч

`.env.example` файлыг `.env` болгож хуулна. `.env`-ийг GitHub руу оруулахгүй.

| Хувьсагч | Утга |
| --- | --- |
| `DATABASE_URL` | Neon холболтын мөр, `sslmode=require` |
| `SESSION_SECRET` | Урт санамсаргүй мөр |
| `ADMIN_EMAIL` | Админы имэйл |
| `ADMIN_PASSWORD` | 8-аас урт нууц үг |
| `PORT` | Локалд 3000. Render өөрөө өгнө |

Neon төслийг Singapore (`ap-southeast-1`) бүсэд нээвэл Render-ийн Singapore сервертэй ойр байна.

## Локал

```bash
npm install
npm start
```

Сайт `http://localhost:3000` дээр нээгдэнэ. XAMPP дээрх PHP хуудсууд хуучин JSON захиалгыг үргэлжлүүлэн хүлээн авна.

## Render

`render.yaml` blueprint-оор `narlag` нэртэй үнэгүй Node үйлчилгээ үүснэ. `DATABASE_URL` ба `ADMIN_PASSWORD`-ийг Render дээр гараар тавина. `SESSION_SECRET`-ийг Render үүсгэнэ. Эрүүл мэндийн шалгалт: `/health`.
