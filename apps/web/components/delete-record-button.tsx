"use client";

export default function DeleteRecordButton() {
  return (
    <button
      className="nx-row-delete"
      type="submit"
      onClick={(event) => {
        if (!window.confirm("Hapus record ini? Tindakan ini tidak dapat dibatalkan.")) {
          event.preventDefault();
        }
      }}
    >
      Hapus
    </button>
  );
}
