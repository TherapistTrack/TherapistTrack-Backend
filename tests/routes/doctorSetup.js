const axios = require('axios')
const { BASE_URL, getAuthToken } = require('../jest.setup')

// Función para generar IDs válidos de 24 caracteres
const generateObjectId = () => {
  const timestamp = Math.floor(Date.now() / 1000)
    .toString(16)
    .padStart(8, '0')
  const randomPart = Math.random().toString(16).substr(2, 16).padEnd(16, '0')
  return timestamp + randomPart
}

// Función para crear el doctor
const createDoctor = async () => {
  const token = await getAuthToken()
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
    Origin: 'http://localhost'
  }

  const doctorUser = {
    id: generateObjectId(),
    names: 'Test',
    lastNames: 'User',
    phones: ['12345678'],
    rol: 'Doctor',
    mails: ['test-doctor@example.com'],
    rolDependentInfo: {
      collegiateNumber: '12345',
      specialty: 'testSpecialty'
    }
  }

  try {
    const response = await axios.post(
      `${BASE_URL}/users/register`,
      doctorUser,
      { headers }
    )
    if (response.status === 201) {
      console.log('Doctor creado:', doctorUser.id)
      return { doctorId: doctorUser.id, headers } // Retornamos el doctorId y headers
    }
  } catch (error) {
    console.error(
      'Error creating doctor:',
      error.response ? error.response.data : error.message
    )
    throw error
  }
}

// Función para eliminar el doctor
const deleteDoctor = async (doctorId, headers) => {
  try {
    const response = await axios.delete(`${BASE_URL}/users/delete`, {
      data: { id: doctorId },
      headers
    })
    expect(response.status).toBe(200)
    console.log('Doctor eliminado:', doctorId)
  } catch (error) {
    console.error(
      'Error deleting doctor:',
      error.response ? error.response.data : error.message
    )
    throw error
  }
}

module.exports = { createDoctor, deleteDoctor }
