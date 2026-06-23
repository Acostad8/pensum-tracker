import { useDropzone } from "react-dropzone";

export default function FileDropzone({ label, file, onFileSelected }) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
    onDrop: (accepted) => {
      if (accepted[0]) onFileSelected(accepted[0]);
    },
  });

  const borderColor = isDragActive
    ? "border-ufpso-500 bg-ufpso-50 dark:bg-ufpso-900/30"
    : file
    ? "border-state-approved bg-state-approvedBg/40 dark:bg-green-900/20"
    : "border-slate-300 bg-white hover:border-ufpso-400 hover:bg-ufpso-50/40 dark:border-slate-700 dark:bg-slate-800/40 dark:hover:border-ufpso-600 dark:hover:bg-ufpso-900/20";

  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
        {label}
      </label>
      <div
        {...getRootProps()}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition ${borderColor}`}
      >
        <input {...getInputProps()} />

        {file ? (
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-state-approved/15 text-state-approved">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M16.704 5.29a1 1 0 010 1.42l-7.5 7.5a1 1 0 01-1.42 0L3.296 9.71a1 1 0 011.42-1.42l3.778 3.78 6.79-6.78a1 1 0 011.42 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                {file.name}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {(file.size / 1024).toFixed(0)} KB · clic para reemplazar
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-ufpso-100 text-ufpso-600 dark:bg-ufpso-900/40 dark:text-ufpso-300">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4.5v15m7.5-7.5h-15"
                />
              </svg>
            </div>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Arrastra el PDF aquí o haz clic
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Solo archivos .pdf
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
