import { Building2, ExternalLink, MapPin, Phone } from "lucide-react";

type Institution = {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  maps_url: string | null;
};

export function LocationsSection({
  institutions,
}: {
  institutions: Institution[];
}) {
  if (!institutions || institutions.length === 0) return null;

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-12 lg:py-16">
      <div className="mb-8 max-w-2xl">
        <span className="inline-flex items-center gap-2 rounded-full border bg-card/60 px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur">
          <Building2 className="h-3 w-3 text-primary" />
          Lokasyonlar
        </span>
        <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
          Bizi nerede bulursun?
        </h2>
        <p className="mt-2 text-sm text-muted-foreground sm:text-base">
          Üç ayrı merkez. Sana yakın olanı seç, hafta hafta değiştirebilirsin.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {institutions.map((inst) => (
          <article
            key={inst.id}
            className="flex flex-col rounded-2xl border bg-card p-6 transition-shadow hover:shadow-md"
          >
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/12 text-primary ring-1 ring-primary/20">
              <Building2 className="h-5 w-5" strokeWidth={2} />
            </div>
            <h3 className="font-semibold">{inst.name}</h3>

            <dl className="mt-3 flex-1 space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <dd className="text-muted-foreground">
                  {inst.address ?? (
                    <span className="italic">Adres bilgisi yakında</span>
                  )}
                </dd>
              </div>
              {inst.phone ? (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <a
                    href={`tel:${inst.phone.replace(/\s/g, "")}`}
                    className="font-medium hover:text-primary"
                  >
                    {inst.phone}
                  </a>
                </div>
              ) : null}
            </dl>

            {inst.maps_url ? (
              <a
                href={inst.maps_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
              >
                Yol tarifi
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}
