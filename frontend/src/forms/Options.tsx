interface OptionsProps<T extends { id: number }> {
  items: T[] | undefined
  /** The first option, chosen while nothing is: "Choisissez une salle". */
  placeholder: string
  label: (item: T) => string
}

/** The options of a select that chooses an item by its id. */
export function Options<T extends { id: number }>({ items = [], placeholder, label }: OptionsProps<T>) {
  return (
    <>
      <option value="">{placeholder}</option>
      {items.map((item) => (
        <option key={item.id} value={item.id}>
          {label(item)}
        </option>
      ))}
    </>
  )
}
