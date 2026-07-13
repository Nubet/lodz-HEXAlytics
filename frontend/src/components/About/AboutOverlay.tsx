import { ModalDialog } from '@/components/shared/ModalDialog';

interface AboutOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AboutOverlay({ isOpen, onClose }: AboutOverlayProps) {
  return (
    <ModalDialog isOpen={isOpen} onClose={onClose} label="O projekcie" className="fixed inset-0 z-100 flex items-center justify-center p-6 starting:opacity-0">
      <button
        type="button"
        className="absolute inset-0 border-0 bg-transparent p-0"
        onClick={onClose}
        aria-label="Zamknij okno O projekcie"
      />
      <div className="elevated-dialog thin-scrollbar relative max-h-[86vh] w-full max-w-205 overflow-auto rounded-card p-8 text-surface-elevated-foreground shadow-surface-dialog-strong starting:translate-y-4 starting:scale-[0.98] starting:opacity-0 max-[640px]:p-6">
        <div className="overlay-soft-glow pointer-events-none absolute inset-0 opacity-50" />

        <button
          type="button"
          className="dialog-close-button absolute top-4 right-4 z-10 size-8.5 text-xl leading-none"
          onClick={onClose}
          aria-label="Zamknij"
        >
          ×
        </button>

        <header className="relative z-10 mb-6 grid gap-2.5">
          <span className="overline-label">O projekcie</span>
          <h2 className="font-display text-[28px] font-semibold max-[640px]:text-2xl">
            Szybki wgląd w zdarzenia drogowe
          </h2>
          <p className="text-body-muted">
              "HexaLytics" to interaktywna mapa zdarzeń drogowych w Łodzi, zaprojektowana tak, aby szybko przechodzić
            od ogólnego obrazu miasta do konkretnych przypadków i ich szczegółów.
          </p>
        </header>

        <section className="relative z-10 mt-5 border-t border-surface-elevated-divider pt-4">
          <h3 className="mb-3 text-base font-semibold">Co tu zobaczysz</h3>
          <ul className="grid gap-2.5">
            <li className="surface-info-card grid gap-1 px-3.5 py-3">
              <span className="overline-label">Zdarzenia</span>
              <span className="text-sm text-surface-elevated-muted">pojedyncze wypadki i kolizje pokazane w konkretnych lokalizacjach</span>
            </li>
            <li className="surface-info-card grid gap-1 px-3.5 py-3">
              <span className="overline-label">Zagęszczenie 2D</span>
              <span className="text-sm text-surface-elevated-muted">szybki obraz skali zjawiska i zmian widocznych po filtrowaniu lub zmianie rozmiaru siatki</span>
            </li>
            <li className="surface-info-card grid gap-1 px-3.5 py-3">
              <span className="overline-label">Zagęszczenie 3D</span>
              <span className="text-sm text-surface-elevated-muted">wysokość słupków dodatkowo wzmacnia różnice między obszarami</span>
            </li>
          </ul>
        </section>

        <section className="relative z-10 mt-6 border-t border-surface-elevated-divider pt-4">
          <h3 className="mb-3 text-base font-semibold">Kiedy używać którego widoku</h3>
          <div className="grid gap-3">
            <div className="surface-info-card grid gap-1 px-3.5 py-3">
              <span className="overline-label">Zdarzenia</span>
              <p className="text-sm text-surface-elevated-muted">Wybierz ten widok, gdy chcesz zobaczyć konkretne przypadki, ich położenie oraz szczegóły pojedynczych zdarzeń.</p>
            </div>
            <div className="surface-info-card grid gap-1 px-3.5 py-3">
              <span className="overline-label">Zagęszczenie 2D</span>
              <p className="text-sm text-surface-elevated-muted">To najszybszy sposób, aby ocenić skalę zjawiska, wychwycić skupiska i zobaczyć, jak zmienia się obraz po zmianie filtrów lub rozmiaru heksagonów.</p>
            </div>
            <div className="surface-info-card grid gap-1 px-3.5 py-3">
              <span className="overline-label">Zagęszczenie 3D</span>
              <p className="text-sm text-surface-elevated-muted">Sprawdza się wtedy, gdy chcesz mocniej podkreślić różnice między obszarami, bo wysokość słupków od razu wzmacnia wizualny odbiór natężenia.</p>
            </div>
          </div>
        </section>

        <section className="relative z-10 mt-6 border-t border-surface-elevated-divider pt-4">
          <h3 className="mb-3 text-base font-semibold">Jak czytać widok heksów</h3>
          <div className="grid gap-3">
            <div className="surface-info-card grid gap-1 px-3.5 py-3">
              <span className="overline-label">Dlaczego heksy zmieniają rozmiar?</span>
              <p className="text-sm text-surface-elevated-muted">Rozmiar heksów możesz zmieniać ręcznie. Większe heksy pokazują szerszy obraz miasta i ułatwiają zauważenie ogólnych wzorców. Mniejsze heksy pokazują więcej lokalnych szczegółów.</p>
            </div>
            <div className="surface-info-card grid gap-1 px-3.5 py-3">
              <span className="overline-label">Co oznaczają kolory heksów?</span>
              <p className="text-sm text-surface-elevated-muted">Kolor pokazuje, ile wypadków znajduje się w danym heksie. Chłodniejsze kolory oznaczają mniejszą liczbę zdarzeń. Cieplejsze kolory oznaczają większą liczbę zdarzeń.</p>
            </div>
            <div className="surface-info-card grid gap-1 px-3.5 py-3">
              <span className="overline-label">Dlaczego kolory mogą się zmieniać po użyciu filtrów?</span>
              <p className="text-sm text-surface-elevated-muted">Kolory są liczone względem aktualnie widocznych wyników. Gdy zmienisz rok, dzielnicę albo rodzaj zdarzeń, skala kolorów przelicza się na nowo. Przez to ta sama liczba wypadków może wyglądać inaczej niż wcześniej.</p>
            </div>
            <div className="surface-info-card grid gap-1 px-3.5 py-3">
              <span className="overline-label">Czy jeden heks oznacza jeden rodzaj wypadków?</span>
              <p className="text-sm text-surface-elevated-muted">Nie. Jeden heks może zawierać różne typy zdarzeń i różne poziomy ciężkości. Heks pokazuje grupę wypadków z danego obszaru, a nie jeden konkretny przypadek.</p>
            </div>
          </div>
        </section>

        <section className="relative z-10 mt-6 border-t border-surface-elevated-divider pt-4">
          <h3 className="mb-3 text-base font-semibold">Ważne uwagi</h3>
          <p className="surface-note-card px-3.5 py-3 text-sm text-surface-elevated-muted">
            To jest wizualizacja poglądowa, a nie narzędzie raportowe ani oficjalne opracowanie.
          </p>
        </section>

        <section className="relative z-10 mt-5 border-t border-surface-elevated-divider pt-4">
          <h3 className="mb-3 text-base font-semibold">Jaki jest cel projektu</h3>
          <ul className="grid gap-2 pl-4.5 text-sm leading-7 text-surface-elevated-muted">
            <li>Pokazać dane o zdarzeniach drogowych w formie, która jest czytelna, szybka w odbiorze i faktycznie pomaga porównywać różne części miasta.</li>
          </ul>
        </section>
      </div>
    </ModalDialog>
  );
}
