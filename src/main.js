import { ok, announce, localStorage } from 'onekit-js';

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


const renderNotes = () => {
  const noteList = ok('#note-list');

  if (!state.notes.length) {
    noteList.html('<li>No notes yet. Add one above!</li>');
    return;
  }
  const notesHtml = state.notes.map(note => `<li>${note.text}</li>`).join('');

  noteList.html(notesHtml);
};


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

const saveAndRender = () => {
  localStorage.set('onekit-notes', state.notes);
  renderNotes();
};

renderNotes();