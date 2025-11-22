import { useState, useEffect, useContext } from 'react';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import { AuthContext } from '../context/AuthContext';

export default function TimetableView() {
  const { user } = useContext(AuthContext);
  const [timetable, setTimetable] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const res = await api.get('/timetable', {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setTimetable(res.data);
    };
    fetchData();
  }, []);

  return (
    <>
      <Navbar />
      <div className="container mt-4">
        <h3>Timetable</h3>
        <table className="table table-striped mt-3">
          <thead>
            <tr>
              <th>Day</th>
              <th>Time</th>
              <th>Subject</th>
              <th>Faculty</th>
            </tr>
          </thead>
          <tbody>
            {timetable.map((row, i) => (
              <tr key={i}>
                <td>{row.day}</td>
                <td>{row.time}</td>
                <td>{row.subject}</td>
                <td>{row.faculty?.name || 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
