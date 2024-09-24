const axios = require('axios')
const { BASE_URL, getAuthToken } = require('../../../jest.setup')
const { createTestDoctor, deleteUser } = require('../../../testHelpers')

let doctorId
let templateId
let headers

beforeAll(async () => {
  const doctor = await createTestDoctor()
  doctorId = doctor.id
  headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${getAuthToken()}`,
    Origin: 'http://localhost'
  }

  // Crear una plantilla de paciente para usarla en los tests
  const response = await axios.post(
    `${BASE_URL}/doctor/PatientTemplate`,
    {
      doctorId: doctorId,
      name: `testTemplate_${Date.now()}`,
      fields: [
        {
          name: 'Edad',
          type: 'NUMBER',
          required: true,
          description: 'Edad del paciente'
        }
      ]
    },
    { headers }
  )
  templateID = response.data.templateID
})

afterAll(async () => {
  await deleteUser(doctorId)
})

describe('Edit Field from Patient Template Tests', () => {
  // Test para editar correctamente el nombre de un campo ya existente
  it('should edit the name of an existing field in a patient template', async () => {
    const fieldToEdit = {
      doctorId: doctorId,
      templateId: templateId,
      oldFieldName: 'Edad',
      fieldData: {
        name: 'Edad Actualizada',
        type: 'NUMBER',
        required: true,
        description: 'Edad actualizada del paciente'
      }
    }

    try {
      const response = await axios.put(
        `${BASE_URL}/doctor/PatientTemplate/fields`,
        fieldToEdit,
        { headers }
      )
      expect(response.status).toBe(200)
      expect(response.data.message).toBe('Field successfully edited')
    } catch (error) {
      console.error(
        'Error editing field:',
        error.response ? error.response.data : error.message
      )
      throw error
    }
  })

  // CHECK WITH PEO
  // Test para editar un campo ya existente, como cambiar de obligatorio a no obligatorio
  it('should edit an existing field to change required status', async () => {
    const fieldToEdit = {
      doctorId: doctorId,
      templateId: templateId,
      oldFieldName: 'Edad Actualizada',
      fieldData: {
        name: 'Edad Actualizada',
        type: 'NUMBER',
        required: false, // Cambiar "Edad" a no obligatorio
        description: 'Edad no obligatoria del paciente'
      }
    }

    try {
      const response = await axios.put(
        `${BASE_URL}/doctor/PatientTemplate/fields`,
        fieldToEdit,
        { headers }
      )
      expect(response.status).toBe(200)
      expect(response.data.message).toBe('Field successfully edited')
    } catch (error) {
      console.error(
        'Error editing field:',
        error.response ? error.response.data : error.message
      )
      throw error
    }
  })

  // Test para editar el tipo (type) de un campo existente
  it('should successfully change the type of an existing field', async () => {
    const fieldToEdit = {
      doctorId: doctorId,
      templateID: templateId,
      oldFieldName: 'Edad',
      fieldData: {
        name: 'Edad',
        type: 'TEXT', // Cambiamos el tipo de 'NUMBER' a 'TEXT'
        required: true,
        description: 'Edad en formato de texto'
      }
    }

    try {
      const response = await axios.put(
        `${BASE_URL}/doctor/PatientTemplate/fields`,
        fieldToEdit,
        { headers }
      )
      expect(response.status).toBe(200)
      expect(response.data.message).toBe('Field successfully edited')
    } catch (error) {
      console.error(
        'Error editing field type:',
        error.response ? error.response.data : error.message
      )
      throw error
    }
  })

  // Test para realizar múltiples cambios en la plantilla
  it('should successfully update multiple fields in the patient template', async () => {
    const updatedFields = {
      doctorId: doctorId,
      templateId: templateId,
      fields: [
        {
          oldFieldName: 'Edad Actualizada',
          fieldData: {
            name: 'Edad Final',
            type: 'TEXT', // Cambio de NUMBER a TEXT
            required: true,
            description: 'Edad final del paciente'
          }
        },
        {
          oldFieldName: 'Estado Civil',
          fieldData: {
            name: 'Estado Civil',
            type: 'CHOICE',
            options: ['Soltero', 'Casado', 'Divorciado'],
            required: true,
            description: 'Estado civil actualizado del paciente'
          }
        }
      ]
    }

    try {
      const response = await axios.patch(
        `${BASE_URL}/doctor/PatientTemplate/fields`,
        updatedFields,
        { headers }
      )
      expect(response.status).toBe(200)
      expect(response.data.message).toBe('Fields successfully edited')
    } catch (error) {
      console.error(
        'Error updating fields:',
        error.response ? error.response.data : error.message
      )
      throw error
    }
  })

  // Test para omitir el templateID y recibir un error
  it('should fail to edit a field without templateID', async () => {
    const fieldToEdit = {
      doctorId: doctorId,
      oldFieldName: 'Edad',
      fieldData: {
        name: 'Edad',
        type: 'NUMBER',
        required: true,
        description: 'Edad del paciente'
      }
    }

    try {
      await axios.put(
        `${BASE_URL}/doctor/PatientTemplate/fields`,
        fieldToEdit,
        { headers }
      )
    } catch (error) {
      expect(error.response.status).toBe(400)
      expect(error.response.data.message).toBe('Missing template ID')
    }
  })

  // Test para fallar al asignar un tipo de campo no permitido
  it('should fail to assign an invalid field type', async () => {
    const fieldToEdit = {
      doctorId: doctorId,
      templateID: templateId,
      oldFieldName: 'Edad',
      fieldData: {
        name: 'Edad',
        type: 'INVALID_TYPE', // Tipo no permitido
        required: true,
        description: 'Edad del paciente'
      }
    }

    try {
      await axios.put(
        `${BASE_URL}/doctor/PatientTemplate/fields`,
        fieldToEdit,
        { headers }
      )
    } catch (error) {
      expect(error.response.status).toBe(400)
      expect(error.response.data.message).toBe('Invalid field type')
    }
  })

  // Test para verificar la propiedad 'required'
  it('should fail when attempting to edit the required attribute incorrectly', async () => {
    const fieldToEdit = {
      doctorId: doctorId,
      templateID: templateId,
      oldFieldName: 'Edad',
      fieldData: {
        name: 'Edad',
        type: 'NUMBER',
        required: 'invalid_value', // Valor no válido para required
        description: 'Edad del paciente'
      }
    }

    try {
      await axios.put(
        `${BASE_URL}/doctor/PatientTemplate/fields`,
        fieldToEdit,
        { headers }
      )
    } catch (error) {
      expect(error.response.status).toBe(406)
      expect(error.response.data.message).toBe(
        "La edición no se puede llevar a cabo. Valor incorrecto en el atributo 'required'."
      )
    }
  })

  // Test para no cambiar el campo reservado 'Nombres'
  it("should not allow to edit field 'Nombres'", async () => {
    const fieldToEdit = {
      doctorId: doctorId,
      templateID: templateId,
      oldFieldName: 'Nombres',
      fieldData: {
        name: 'Nombres',
        options: [],
        required: true,
        description: 'Nombre del paciente'
      }
    }

    try {
      await axios.put(
        `${BASE_URL}/doctor/PatientTemplate/fields`,
        fieldToEdit,
        { headers }
      )
    } catch (error) {
      expect(error.response.status).toBe(406)
      expect(error.response.data.message).toBe(
        "The 'Nombres' field cannot be edited because it is a reserved field"
      )
    }
  })

  // Test para no cambiar el campo reservado 'Apellidos'
  it("should not allow to edit field 'Apellidos'", async () => {
    const fieldToEdit = {
      doctorId: doctorId,
      templateID: templateId,
      oldFieldName: 'Apellidos',
      fieldData: {
        name: 'Apellidos',
        options: [],
        required: true,
        description: 'Apellido del paciente'
      }
    }

    try {
      await axios.put(
        `${BASE_URL}/doctor/PatientTemplate/fields`,
        fieldToEdit,
        { headers }
      )
    } catch (error) {
      expect(error.response.status).toBe(406)
      expect(error.response.data.message).toBe(
        "The 'Apellidos' field cannot be edited because it is a reserved field"
      )
    }
  })
})
