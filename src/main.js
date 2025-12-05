import { ok, announce, localStorage } from 'onekit-js';

// --- STATE MANAGEMENT ---

const loadNotes = () => {
  try {
    const stored = localStorage.get('onekit-notes');
    if (!stored) return [];
    if (typeof stored.value === "string") {
      const parsed = JSON.parse(stored.value);
      return Array.isArray(parsed) ? parsed : [];
    }
    if (Array.isArray(stored)) return stored;
    return [];
  } catch {
    return [];
  }
};

const state = {
  notes: loadNotes()
};

// --- RENDERING ---

const renderNotes = () => {
  const noteList = ok('#note-list');

  if (!state.notes.length) {
    noteList.html('<li>No notes yet. Add one above!</li>');
    return;
  }

  // Build the entire list as an HTML string, including buttons
  const notesHtml = state.notes.map(note => {
    const doneClass = note.done ? 'class="done"' : '';
    return `
      <li ${doneClass}>
        ${note.text}
        <span class="note-actions">
          <button class="done-btn" data-id="${note.id}">${note.done ? 'Undo' : 'Done'}</button>
          <button class="delete-btn" data-id="${note.id}">Delete</button>
        </span>
      </li>
    `;
  }).join('');

  noteList.html(notesHtml);

  // Re-attach event listeners to the new buttons
  attachNoteListeners();
};

// --- EVENT HANDLER ATTACHMENT ---

const attachNoteListeners = () => {
  ok('.done-btn').on('click', (e) => {
    // Get the ID from the button's data-id attribute
    const id = Number(e.target.getAttribute('data-id'));
    toggleDone(id);
  });

  ok('.delete-btn').on('click', (e) => {
    const id = Number(e.target.getAttribute('data-id'));
    deleteNote(id);
  });
};

// --- ACTION FUNCTIONS ---

const toggleDone = (id) => {
  const item = state.notes.find(n => n.id === id);
  if (!item) return;
  item.done = !item.done;
  saveAndRender();
  announce(`Note marked as ${item.done ? 'done' : 'not done'}.`);
};

const deleteNote = (id) => {
  state.notes = state.notes.filter(n => n.id !== id);
  saveAndRender();
  announce('Note deleted.');
};

// --- FORM SUBMISSION ---

ok('#note-form').on('submit', (e) => {
  e.preventDefault();
  const input = document.querySelector('#note-input');
  const text = input.value.trim();
  if (!text) return;

  state.notes.unshift({
    id: Date.now(),
    text,
    done: false
  });

  saveAndRender();
  input.value = '';
  announce('New note added!');
});

// --- UTILITY FUNCTIONS ---

const saveAndRender = () => {
  localStorage.set('onekit-notes', state.notes);
  renderNotes();
};

// --- INITIALIZATION ---

// Initial render of the notes when the page loads.
renderNotes();