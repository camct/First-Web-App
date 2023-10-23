import { useEffect, useState } from 'react';
import axios from "axios"
import { format } from "date-fns";

import './App.css';

const baseUrl = "http://localhost:5000"

function App() {
  const [description, setDescription] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [eventsList, setEventsList] = useState([]);
  const [eventId, setEventId] = useState(null);

  const fetchEvents = async () => {
    const data = await axios.get(`${baseUrl}/events`)
    const { events } = data.data
    setEventsList(events);
    // console.log("Data:", data)
  }

  // takes in an event and updates when it changes
  const handleChange = (e, field) => {
    if (field === "edit") {
      setEditDescription(e.target.value);
    } else {
      setDescription(e.target.value);
    }
  }

  const toggleEdit = (event) => {
    setEventId(event.id);
    setEditDescription(event.description);

  }

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${baseUrl}/events/${id}`);
      const updatedList = eventsList.filter(event => event.id !== id);
      setEventsList(updatedList);
    } catch (err) {
      console.error(err.message)
    }
  }

  const handleSubmit = async (e) => {
    //when you submit default is to refresh page... we dont want, we just want to append
    e.preventDefault();
    try {
      if (editDescription) {
        const data = await axios.put(`${baseUrl}/events/${eventId}`, { description: editDescription });
        const updatedEvent = data.data.event;
        const updatedList = eventsList.map(event => {
          if (event.id === eventId) {
            return event = updatedEvent
          }
          return event
        })
        setEventsList(updatedList)
      } else {
        const data = await axios.post(`${baseUrl}/events`, { description })
        setEventsList([...eventsList, data.data]);
      }
      setDescription('');
      setEditDescription('');
      setEventId(null);
    } catch (err) {
      console.error(err.message)
    }

  }

  // htmlFor lets it know what input its attached to

  useEffect(() => {
    fetchEvents();
  }, [])

  return (
    <div className="App">
      <section>
        <form onSubmit={handleSubmit}>
          <label htmlFor="description">Description</label>
          <input
            onChange={(e) => handleChange(e, 'description')}
            type="text"
            name="description"
            id="description"
            placeholder="Describe the event"
            value={description}
          />
          <button type="submit">Submit</button>
        </form>
      </section>
      <section>
        <ul>
          {eventsList.map(event => {
            if (eventId === event.id) {
              return (
                <li key={event.id}>
                  <form onSubmit={handleSubmit} key={event.id}>
                    <input
                      onChange={(e) => handleChange(e, 'edit')}
                      type="text"
                      name="editDescription"
                      id="editDescription"
                      value={editDescription}
                    />
                    <button type="submit">Submit</button>
                  </form>
                </li>
              )

            } else {
              return (
                <li style={{ display: "flex" }} key={event.id}>
                  {format(new Date(event.created_at), "MM/dd, p")}: {" "}
                  {event.description}
                  <button onClick={() => toggleEdit(event)}>Edit</button>
                  <button onClick={() => handleDelete(event.id)}>X</button>
                </li>
              )
            }
          })}
        </ul>
      </section>
    </div >
  );
}

export default App;
