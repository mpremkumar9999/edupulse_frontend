import { useState, useEffect } from 'react'
import API from '../../services/api'
import { Box, Button, TextField, Typography, Card, CardContent } from '@mui/material'

const FacultyAssignments = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    className: '',
    file: null,
  })
  const [assignments, setAssignments] = useState([])

  const fetchAssignments = async () => {
    const res = await API.get('/assignments/teacher')
    setAssignments(res.data)
  }

  useEffect(() => {
    fetchAssignments()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleFile = (e) => {
    setFormData((prev) => ({ ...prev, file: e.target.files[0] }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const data = new FormData()
    data.append('title', formData.title)
    data.append('description', formData.description)
    data.append('className', formData.className)
    if (formData.file) data.append('file', formData.file)

    await API.post('/assignments', data)
    setFormData({ title: '', description: '', className: '', file: null })
    fetchAssignments()
  }

  return (
    <Box p={3}>
      <Typography variant="h5" fontWeight="bold" mb={2}>Create Assignment</Typography>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <TextField name="title" label="Title" value={formData.title} onChange={handleChange} required />
        <TextField name="description" label="Description" value={formData.description} onChange={handleChange} multiline />
        <TextField name="className" label="Class Name" value={formData.className} onChange={handleChange} required />
        <input type="file" onChange={handleFile} />
        <Button type="submit" variant="contained" color="primary">Upload</Button>
      </form>

      <Typography variant="h6" mt={4} mb={1}>My Assignments</Typography>
      {assignments.map((a) => (
        <Card key={a._id} sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="subtitle1" fontWeight="bold">{a.title}</Typography>
            <Typography variant="body2">{a.description}</Typography>
            <Typography variant="body2" color="textSecondary">Class: {a.className}</Typography>
            {a.fileUrl && (
              <a href={`http://localhost:5000${a.fileUrl}`} target="_blank" rel="noreferrer">Download File</a>
            )}
          </CardContent>
        </Card>
      ))}
    </Box>
  )
}

export default FacultyAssignments
