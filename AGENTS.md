# Project Guidance

## User Preferences

- Mobile-first experience: responsive layout, touch-friendly tap targets, installable to the home screen
- Visual style follows the attached FarmPath UI kit: deep green primary, white rounded cards, pepper-plant photography
- Clear navigation hierarchy and appropriate information density

## Verified Commands

- **typecheck**: `pnpm -r typecheck`
- **fix**: `pnpm -r fix`
- **build**: `pnpm -r build`

## Learnings

- Activity.date is a nanosecond timestamp end to end; seed edit forms with timestampToDate(entry.date), never a day-index multiplication.
- Cost activities are modelled with quantity 0, so form validation must only require a positive quantity for harvest/sale kinds.
- React Query keys must distinguish null from a real id (e.g. 'none' vs the id) or disabled null-slot observers clobber real data.
- Backend dashboardSummary counts a crop as active only when it has lessons; derive user-facing crop counts from the crop list instead.
- Motoko text literals do not support backslash-newline continuation; use explicit \n escapes in a single-line literal.
- Two mixins included into the same actor cannot both declare a private function with the same name (M0051); rename one.
- A Map keyed on a tuple needs a local compare function passed positionally to Map.get/add/remove; Tuples.Tuple2.compare is generic and cannot be passed as an implicit comparator.
- Under Enhanced Migration the pending init migration is the correct place to seed built-in catalog content and initialize stable state.
