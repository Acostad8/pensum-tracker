/**
 * Mapea errores del backend a mensajes amigables y opcionalmente una sugerencia.
 */
export function friendlyError(rawMessage) {
  const msg = String(rawMessage || "").toLowerCase();

  if (msg.includes("invertiste") || msg.includes("intercámbialos")) {
    return {
      title: "Archivos invertidos",
      message:
        "Subiste el reporte de notas como pénsum y viceversa. Intercámbialos y vuelve a intentar.",
    };
  }
  if (msg.includes("subiste como pénsum") || msg.includes("no es un pénsum")) {
    return {
      title: "Archivo equivocado en pénsum",
      message:
        "El archivo que subiste como pénsum parece ser un reporte de notas. Sube el pénsum de tu carrera en esa zona.",
    };
  }
  if (msg.includes("subiste como historial") || msg.includes("no es un reporte")) {
    return {
      title: "Archivo equivocado en historial",
      message:
        "El archivo que subiste como historial parece ser un pénsum. Sube el reporte de notas acumuladas.",
    };
  }
  if (msg.includes("no es un pdf")) {
    return {
      title: "Formato no válido",
      message: "Uno de los archivos no es un PDF. Solo se aceptan archivos .pdf",
    };
  }
  if (msg.includes("no se pudieron extraer materias del pénsum")) {
    return {
      title: "Pénsum vacío o no reconocido",
      message:
        "No pude extraer materias del pénsum. ¿El PDF corresponde al pénsum descargado del portal SIA?",
    };
  }
  if (msg.includes("no se pudieron extraer materias del historial")) {
    return {
      title: "Historial vacío o no reconocido",
      message:
        "No pude extraer materias del historial. ¿El PDF es el 'Reporte de notas acumuladas' del portal SIA?",
    };
  }
  if (msg.includes("failed to fetch") || msg.includes("networkerror")) {
    return {
      title: "Sin conexión con el servidor",
      message:
        "No pude conectarme al servidor. Verifica tu conexión o inténtalo más tarde.",
    };
  }

  return {
    title: "Error al procesar los PDFs",
    message: rawMessage || "Ocurrió un error inesperado. Intenta nuevamente.",
  };
}
