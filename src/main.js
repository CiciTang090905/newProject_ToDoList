import "./style.css";

const inputNewNote = document.getElementById("new-note");
const notesWall = document.getElementById("notes-wall");

const addNote = (notes, text, id) => [...notes, { id, text }];

const removeNote = (notes, id) => notes.filter((n) => n.id !== id);

const updateNoteText = (notes, id, newText) =>
    notes.map((n) => (n.id === id ? { ...n, text: newText } : n));

const createNotesApp = () => {
    let notes = [];
    let nextId = 1;
    let editingId = null; // only one note can be edited at a time

    return {
        add: (text) => {
            notes = addNote(notes, text, nextId++);
        },
        remove: (id) => {
            notes = removeNote(notes, id);
            if (editingId === id) editingId = null;
        },
        startEditing: (id) => {
            editingId = id;
        },
        stopEditing: () => {
            editingId = null;
        },
        saveEdit: (id, newText) => {
            notes = updateNoteText(notes, id, newText);
            editingId = null;
        },
        getNotes: () => [...notes],
        getEditingId: () => editingId,
    };
};

const notesApp = createNotesApp();
const createDeleteButton = () => {
    const btn = document.createElement("button");
    btn.classList.add(
        "absolute",
        "w-5",
        "h-5",
        "leading-5",
        "text-center",
        "transition-opacity",
        "opacity-0",
        "cursor-pointer",
        "delete-btn",
        "top-1",
        "right-1",
        "hover:opacity-100",
    );
    btn.textContent = "🗑";
    return btn;
};

const createNoteText = (note, isEditing) => {
    const div = document.createElement("div");
    div.classList.add(
        "p-4",
        "note-text",
        "whitespace-pre-wrap",
        "break-words",
        "[overflow-wrap:anywhere]",
    );
    if (isEditing) div.classList.add("hidden");
    div.textContent = note.text;
    return div;
};

const createNoteEdit = (note, isEditing) => {
    const editText = document.createElement("textarea");
    editText.classList.add(
        "absolute",
        "top-0",
        "left-0",
        "w-full",
        "h-full",
        "p-4",
        "transition-transform",
        "transform",
        "bg-yellow-300",
        "shadow-xl",
        "resize-none",
        "border-0",
        "outline-none",
        "focus:outline-none",
        "focus:ring-0",
        "whitespace-pre-wrap",
        "break-words",
        "[overflow-wrap:anywhere]",
        "note-edit",
    );

    if (!isEditing) editText.classList.add("hidden");
    editText.value = note.text;
    return editText;
};

const createNoteCard = (note, isEditing) => {
    const card = document.createElement("div");
    card.classList.add(
        "relative",
        "w-40",
        "h-40",
        "p-0",
        "m-2",
        "overflow-y-auto",
        "transition-transform",
        "transform",
        "bg-yellow-200",
        "shadow-lg",
        "note",
        "hover:scale-105",
    );
    card.id = `note-${note.id}`;
    const textEl = createNoteText(note, isEditing);
    const editEl = createNoteEdit(note, isEditing);
    card.append(createDeleteButton(), textEl, editEl);
    return card;
};

const parseNoteId = (note) => note ? Number(note.id.split("-").pop()) : -1;

const renderNotes = () => {
    notesWall.innerHTML = "";

    const editId = notesApp.getEditingId();
    const noteElements = notesApp
        .getNotes()
        .map((note) => createNoteCard(note, note.id === editId));

    notesWall.append(...noteElements);

    // focus textarea if we are editing
    if (editId !== null) {
        const editCard = document.getElementById(`note-${editId}`);
        const editText = editCard?.querySelector(".note-edit");
        if (editText) {
            editText.focus();
            editText.setSelectionRange(editText.value.length, editText.value.length);
        }
    }
};

const handleCreateNote = (event) => {
    // Shift+Enter => allow newline in the input textarea
    if (event.key === "Enter" && event.shiftKey) return;

    if (event.key === "Enter") {
        event.preventDefault();

        const text = event.target.value.trim();
        if (!text) {
            event.target.value = "";
            return;
        }
        notesApp.add(text);
        event.target.value = "";
        renderNotes();
    }
};

const handleWallDblClick = (event) => {
    const note = event.target.closest(".note");
    if (!note) return;

    const id = parseNoteId(note);
    if (id === -1) return;

    // only one note in edit mode at a time
    notesApp.startEditing(id);
    renderNotes();
};

const handleWallClick = (event) => {
    const deleteBtn = event.target.closest(".delete-btn");
    if (!deleteBtn) return;

    const note = deleteBtn.closest(".note");
    const id = parseNoteId(note);

    notesApp.remove(id);
    renderNotes();
};

const handleWallKeyDown = (event) => {
    const edit = event.target.closest(".note-edit");
    if (!edit) return;
    // Shift+Enter => newline 
    if (event.key === "Enter" && event.shiftKey) return;
    // Save on Enter or Escape
    if (event.key !== "Enter" && event.key !== "Escape") return;

    event.preventDefault();
    const note = edit.closest(".note");
    const id = parseNoteId(note);
    if (id === -1) return;
    const text = edit.value.trim();
    // If empty after edit, delete note
    if (!text) {
        notesApp.remove(id);
        renderNotes();
        return;
    }
    notesApp.saveEdit(id, text);
    renderNotes();
};

document.addEventListener("click", (event) => {
    // click outside edit textarea saves (if an edit is open)
    const editingId = notesApp.getEditingId();
    if (editingId === null) return;

    if (event.target.closest(".note-edit")) return;

    const editingCard = document.getElementById(`note-${editingId}`);
    const edit = editingCard?.querySelector(".note-edit");
    if (!edit) return;

    const text = edit.value.trim();

    if (!text) {
        notesApp.remove(editingId);
        renderNotes();
        return;
    }

    notesApp.saveEdit(editingId, text);
    renderNotes();
});

document.addEventListener("DOMContentLoaded", renderNotes);
inputNewNote.addEventListener("keydown", handleCreateNote);
notesWall.addEventListener("dblclick", handleWallDblClick);
notesWall.addEventListener("click", handleWallClick);
notesWall.addEventListener("keydown", handleWallKeyDown);
