import { HelpCircle } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQ = [
  {
    q: "Q Deneme nedir?",
    a: "Üç ayrı lokasyonda haftalık deneme sınavı düzenlediğimiz bir kulüptür. Her hafta farklı yayınların TYT/AYT denemelerini sınav ortamında çözebilirsin.",
  },
  {
    q: "Sınava nasıl katılırım?",
    a: "Önce ana sayfadaki ön başvuru formunu doldur. Kurum seninle iletişime geçer, kayıt sürecini telefonda netleştiririz. Kayıt olduktan sonra sana bir kullanıcı adı ve şifre veririz.",
  },
  {
    q: "Hangi sınıflar katılabilir?",
    a: "9, 10, 11, 12. sınıflar ve mezunlar — hepsine açığız. Sınıf ve bölümünü kayıt sırasında belirtmen yeterli.",
  },
  {
    q: "Hangi yayınların denemeleri var?",
    a: "Her hafta kurum tarafından belirlenen 4-6 yayının denemesi açılır. 3D, Karekök, Limit, Apotemi, Esen, Bilgi gibi tanıdık markalar düzenli olarak listede yer alır.",
  },
  {
    q: "Hangi gün, saat kaçta sınav oluyor?",
    a: "Sınavlar her Pazar günü düzenlenir. Q Work merkezinde birden fazla seans seçebilirsin (sabah/öğleden sonra), KNT Akademi merkezlerinde tek seans halinde gerçekleşir.",
  },
  {
    q: "Seçimimi ne zamana kadar yapabilirim?",
    a: "Sınav tarihinden 10 gün önce seçimler kapanır. Bu tarihe kadar yayın ve seansını dilediğin kadar değiştirebilirsin. Seçim yapmadıysan kurumun belirlediği varsayılan yayın atanır.",
  },
  {
    q: "Şifremi unuttum, ne yapmalıyım?",
    a: "Şifre sıfırlama için kurumuna başvur. Kurum yöneticisi panelinden sana yeni bir şifre tanımlayabilir.",
  },
  {
    q: "Bir hafta katılmazsam ne olur?",
    a: "Bir şey olmaz. Sadece o haftanın denemesini çözmemiş olursun. Bir sonraki hafta sistemde tekrar yer alırsın.",
  },
];

export function FaqSection() {
  return (
    <section className="mx-auto w-full max-w-3xl px-4 py-12 lg:py-16">
      <div className="mb-8 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border bg-card/60 px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur">
          <HelpCircle className="h-3 w-3 text-primary" />
          Sıkça sorulanlar
        </span>
        <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
          Aklındaki sorular
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Bulamadığın bir konu varsa formu doldur, kurum seni arayıp anlatsın.
        </p>
      </div>

      <Accordion
        type="single"
        collapsible
        className="rounded-2xl border bg-card px-2 shadow-sm"
      >
        {FAQ.map((item, i) => (
          <AccordionItem key={i} value={`item-${i}`} className="px-2">
            <AccordionTrigger className="text-left text-sm font-semibold sm:text-base">
              {item.q}
            </AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground">
              {item.a}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
