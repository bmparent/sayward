# Sayward visual fidelity ledger

Reviewed August 22, 2026 against:

- `artifacts/design/sayward-concept.png`
- `artifacts/design/sayward-desktop.png`
- `artifacts/design/sayward-mobile.png`

## Five-point comparison

1. **Composition — matched.** The implementation preserves the editorial header, asymmetric
   two-column desktop workbench, central hairline, left-side composer, and right-side manuscript.
2. **Typography and color — matched.** Large navy serif display type, compact uppercase labels,
   warm paper background, restrained rules, and vermilion action buttons all carry through.
3. **Controls — matched with practical refinement.** Scenario tabs, bordered fields, segmented
   tone selector, character counts, and copy control follow the concept. The built controls have
   larger hit areas and explicit selected states.
4. **Paid-state storytelling — intentionally changed.** The concept displayed paid content above
   the lock. The product version shows one useful free opening, then blurred structural previews
   and a specific benefit statement so the $3 boundary is real and understandable.
5. **Responsive behavior — adapted faithfully.** At 820 px the split collapses into one readable
   column. The 390 px receipt shows the headline, six scenarios, and fields without horizontal
   overflow or clipped text. The script follows below the composer.

## Above-the-fold copy diff

| Surface | Concept | Implementation | Reason |
| --- | --- | --- | --- |
| Headline | “Find the words. Keep your nerve.” | Same | Core promise retained. |
| Subhead | “A clear script for the conversation you've been avoiding.” | “A clear script for the conversation you have been avoiding.” | Avoids typographic apostrophe inconsistency in generated environments. |
| Privacy line | “Your words stay in this browser.” | Same | Key product truth retained. |
| Paywall benefit | “The full plan includes more options tailored to your situation.” | Names pushback reply, exit line, and three-step prep list. | Makes the paid value concrete. |
| Purchase note | “One-time unlock. Use as many times as you need.” | Current source says “One-time purchase. Unlocks full plans in this browser.” | Removes a broader persistence promise that local storage cannot guarantee. |

## Remaining visual check

The desktop receipt predates the final purchase-note wording and legal footer links; neither
changes the recorded above-the-fold geometry. A fresh checkout-enabled desktop and mobile pass
is still required immediately before public access is enabled.
