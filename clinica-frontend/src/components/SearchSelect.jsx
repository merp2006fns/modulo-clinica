import React, { useState, useEffect, useRef } from "react";

export default function SearchSelect({
  onSearch,
  onChange = () => {},
  value = "",
  placeholder = "Buscar...",
  name,
  id,
  minSearchLength = 2,
  debounceMs = 300,
  initialOptions = [],
  enabled = true,
}) {
  const [query, setQuery] = useState("");
  const [options, setOptions] = useState(initialOptions);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef(null);

  useEffect(() => {
    setOptions(initialOptions);
  }, [initialOptions]);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (query.length < minSearchLength) {
      setOptions(initialOptions);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      if (typeof onSearch !== "function") {
        setOptions(initialOptions);
        return;
      }

      setLoading(true);
      try {
        const res = await onSearch(query);
        setOptions(Array.isArray(res) ? res : []);
      } catch (e) {
        console.error(e);
        setOptions(initialOptions);
      } finally {
        setLoading(false);
      }
    }, debounceMs);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, onSearch, minSearchLength, debounceMs, initialOptions]);

  return (
    <div>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        disabled={!enabled}
      />
      <select
        name={name}
        id={id}
        value={value}
        onChange={(e) => {
          const selectedId =
            e.target.value === "" ? "" : Number(e.target.value);
          onChange(selectedId);
        }}
        disabled={!enabled}
      >
        <option value="">{loading ? "Cargando..." : "Selecciona"}</option>
        {options.map((opt) => (
          <option key={opt.id} value={opt.id}>
            {opt.nombre}
          </option>
        ))}
      </select>
    </div>
  );
}
