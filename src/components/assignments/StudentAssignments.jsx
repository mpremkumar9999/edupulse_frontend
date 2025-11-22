import { useEffect, useState } from 'react'
import API from '../../services/api'
import { Box, Typography, Card, CardContent } from '@mui/material'

const StudentAssignments = ({ className }) => {
  const [assignments, setAssignments] = useState([])

  useEffect(() => {
    if (!className) return
    const fetchAssignments = async () => {
      const res = await API.get(`/assignments/class/${className}`)
      setAssignments(res.data)
    }
    fetchAssignments()
  }, [className])

  return (
    <Box p={3}>
      <Typography variant="h5" fontWeight="bold" mb={2}>
        Assignments for {className}
      </Typography>

      {assignments.length === 0 ? (
        <Typography>No assignments found.</Typography>
      ) : (
        assignments.map((a) => (
          <Card key={a._id} sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight="bold">{a.title}</Typography>
              <Typography variant="body2">{a.description}</Typography>
              <Typography variant="caption" display="block">Posted on: {new Date(a.createdAt).toLocaleDateString()}</Typography>
              {a.fileUrl && (
                <a href={`http://localhost:5000${a.fileUrl}`} target="_blank" rel="noreferrer">
                  📎 Download File
                </a>
              )}
            </CardContent>
          </Card>
        ))
      )}
    </Box>
  )
}

export default StudentAssignments
