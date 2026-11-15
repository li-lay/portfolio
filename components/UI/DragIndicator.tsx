const DragIndicator = () => {
  return (
    <div className="pointer-events-none absolute bottom-10 left-1/2 -translate-x-1/2 md:bottom-auto md:left-auto md:right-8 md:top-1/2 md:-translate-y-1/2 md:translate-x-0">
      <div className="flex flex-col items-center gap-2 text-fg0">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
          className="animate-drag text-green"
        >
          <path
            d="M4 12H20M4 12L8 8M4 12L8 16M20 12L16 8M20 12L16 16"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className="font-patua_one text-sm font-medium">Drag to rotate</span>
      </div>
    </div>
  );
};

export default DragIndicator;
