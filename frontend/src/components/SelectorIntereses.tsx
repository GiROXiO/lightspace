import { useIntereses } from "@/lib/catalogos";

interface Props {
  seleccion: string[];
  cambiar: (seleccion: string[]) => void;
}

export function SelectorIntereses({ seleccion, cambiar }: Props) {
  const { data: intereses, isPending, error } = useIntereses();

  const alternar = (interes: string) =>
    cambiar(
      seleccion.includes(interes)
        ? seleccion.filter((i) => i !== interes)
        : [...seleccion, interes],
    );

  return (
    <fieldset>
      <legend className="mb-2 text-sm font-medium">Intereses (opcional)</legend>
      {isPending && (
        <p className="text-sm text-muted-foreground">Cargando intereses...</p>
      )}
      {error && <p className="text-sm text-destructive">{error.message}</p>}
      <div className="flex flex-wrap gap-2">
        {intereses?.map((interes) => {
          const activo = seleccion.includes(interes);
          return (
            <button
              key={interes}
              type="button"
              aria-pressed={activo}
              onClick={() => alternar(interes)}
              className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                activo
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-input bg-card hover:bg-muted"
              }`}
            >
              {interes}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
