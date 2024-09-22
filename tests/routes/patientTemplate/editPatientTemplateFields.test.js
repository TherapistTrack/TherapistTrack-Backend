const { createDoctor, deleteDoctor } = require('../doctorSetup')
const axios = require('axios')
const { BASE_URL } = require('../../jest.setup')

let doctorId
let templateId
let headers

beforeAll(async () => {
  const setup = await createDoctor()
  doctorId = setup.doctorId
  headers = setup.headers

  // Crear una plantilla de paciente para usarla en los tests
  const response = await axios.post(
    `${BASE_URL}/templates/create`,
    {
      doctorId: doctorId,
      name: `testTemplate_${Date.now()}`,
      patientTemplate: {
        record: '12345',
        names: 'Plantilla-2024',
        fields: [
          { name: 'Nombres', type: 'SHORT_TEXT', required: true },
          { name: 'Apellidos', type: 'SHORT_TEXT', required: true },
          { name: 'Edad', type: 'NUMBER', required: true }
        ]
      }
    },
    { headers }
  )
  templateId = response.data.data.patientTemplateId
})

afterAll(async () => {
  await deleteDoctor(doctorId, headers)
})

describe('Edit Field from Patient Template Tests', () => {
  // Test para editar correctamente el nombre de un campo ya existente
  it('should edit the name of an existing field in a patient template', async () => {
    const fieldToEdit = {
      templateId: templateId,
      oldFieldName: 'Apellidos',
      newField: {
        name: 'Apellido Completo',
        type: 'SHORT_TEXT',
        required: true
      }
    }

    try {
      const response = await axios.put(
        `${BASE_URL}/templates/editField`,
        fieldToEdit,
        { headers }
      )
      expect(response.status).toBe(200)
      expect(response.data.message).toBe('Campo editado correctamente')
    } catch (error) {
      console.error(
        'Error editing field:',
        error.response ? error.response.data : error.message
      )
      throw error
    }
  })

  // Test para editar un campo ya existente, como cambiar de obligatorio a no obligatorio
  it('should edit an existing field to change required status', async () => {
    const fieldToEdit = {
      templateId: templateId,
      oldFieldName: 'Edad',
      newField: {
        name: 'Edad',
        type: 'NUMBER',
        required: false // Cambiar "Edad" a no obligatorio
      }
    }

    try {
      const response = await axios.put(
        `${BASE_URL}/templates/editField`,
        fieldToEdit,
        { headers }
      )
      expect(response.status).toBe(200)
      expect(response.data.message).toBe('Campo editado correctamente')
    } catch (error) {
      console.error(
        'Error editing field:',
        error.response ? error.response.data : error.message
      )
      throw error
    }
  })

  // Test para agregar un nuevo campo a la plantilla
  it('should successfully add a new field to the patient template', async () => {
    const newField = {
      templateId: templateId,
      newField: {
        name: 'Teléfono',
        type: 'PHONE',
        required: false
      }
    }

    try {
      const response = await axios.put(
        `${BASE_URL}/templates/addField`,
        newField,
        { headers }
      )
      expect(response.status).toBe(200)
      expect(response.data.message).toBe('Campo añadido correctamente')
    } catch (error) {
      console.error(
        'Error adding new field:',
        error.response ? error.response.data : error.message
      )
      throw error
    }
  })

  // Test para editar el tipo (type) de un campo existente
  it('should successfully change the type of an existing field', async () => {
    const fieldToEdit = {
      templateId: templateId,
      oldFieldName: 'Edad',
      newField: {
        name: 'Edad',
        type: 'SHORT_TEXT', // Cambiamos el tipo de 'NUMBER' a 'SHORT_TEXT'
        required: true
      }
    }

    try {
      const response = await axios.put(
        `${BASE_URL}/templates/editField`,
        fieldToEdit,
        { headers }
      )
      expect(response.status).toBe(200)
      expect(response.data.message).toBe('Campo editado correctamente')
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
    const updatedFields = [
      { name: 'Nombres', type: 'SHORT_TEXT', required: true },
      { name: 'Apellido Completo', type: 'SHORT_TEXT', required: true }, // Editado antes
      { name: 'Edad', type: 'NUMBER', required: false }, // Editado en el test anterior
      {
        name: 'Estado Civil',
        type: 'CHOICE',
        options: ['Soltero', 'Casado'],
        required: true
      }
    ]

    try {
      const response = await axios.patch(
        `${BASE_URL}/doctor/PatientTemplate`,
        {
          doctorId: doctorId,
          templateID: templateId,
          updatedFields
        },
        { headers }
      )

      expect(response.status).toBe(200)
      expect(response.data.message).toBe(
        'Campos de la plantilla de paciente actualizados exitosamente'
      )
    } catch (error) {
      console.error(
        'Error updating fields:',
        error.response ? error.response.data : error.message
      )
      throw error
    }
  })

  // Test para omitir el templateID y recibir un error
  it('should fail to edit a patient template without templateID', async () => {
    const updatedFields = [
      { name: 'Nombres', type: 'SHORT_TEXT', required: true }
    ]

    try {
      await axios.patch(
        `${BASE_URL}/doctor/PatientTemplate`,
        {
          doctorId: doctorId,
          updatedFields // Omitimos templateID para provocar el error
        },
        { headers }
      )
    } catch (error) {
      expect(error.response.status).toBe(400)
      expect(error.response.data.message).toBe(
        'Solicitud incorrecta: Falta el ID de la plantilla'
      )
    }
  })

  // Test para evitar duplicados en los nombres de los campos
  it('should fail to edit a field with a duplicate name', async () => {
    const fieldToEdit = {
      templateId: templateId,
      oldFieldName: 'Nombres',
      newField: {
        name: 'Apellidos', // Ya existe un campo con este nombre
        type: 'SHORT_TEXT',
        required: true
      }
    }

    try {
      await axios.put(`${BASE_URL}/templates/editField`, fieldToEdit, {
        headers
      })
    } catch (error) {
      expect(error.response.status).toBe(400)
      expect(error.response.data.message).toBe(
        'Ya existe un campo con este nombre'
      )
    }
  })

  // Test para fallar al asignar un tipo de campo no permitido
  it('should fail to assign an invalid field type', async () => {
    const fieldToEdit = {
      templateId: templateId,
      oldFieldName: 'Nombres',
      newField: {
        name: 'Nombres',
        type: 'INVALID_TYPE', // Tipo inválido
        required: true
      }
    }

    try {
      await axios.put(`${BASE_URL}/templates/editField`, fieldToEdit, {
        headers
      })
    } catch (error) {
      expect(error.response.status).toBe(400)
      expect(error.response.data.message).toBe('Tipo de campo inválido')
    }
  })

  // Test para evitar edición sin cambios
  it('should fail to edit a field with no changes', async () => {
    const fieldToEdit = {
      templateId: templateId,
      oldFieldName: 'Nombres',
      newField: {
        name: 'Nombres',
        type: 'SHORT_TEXT', // Mismo tipo, sin cambios
        required: true
      }
    }

    try {
      await axios.put(`${BASE_URL}/templates/editField`, fieldToEdit, {
        headers
      })
    } catch (error) {
      expect(error.response.status).toBe(400)
      expect(error.response.data.message).toBe(
        'No se realizaron cambios en el campo'
      )
    }
  })

  // Test para obtener una plantilla por su ID correctamente
  it('should successfully retrieve a patient template by its ID', async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}/doctor/PatientTemplate?templateId=${templateId}`,
        { headers }
      )

      expect(response.status).toBe(200)
      expect(response.data).toHaveProperty('doctor', doctorId)
      expect(response.data).toHaveProperty('lastUpdated') // Se asegura de que el campo "lastUpdated" esté presente
      expect(response.data).toHaveProperty('name', 'Plantilla-2024')
      expect(response.data.fields).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            name: 'Nombres',
            type: 'SHORT_TEXT',
            required: true
          }),
          expect.objectContaining({
            name: 'Apellidos',
            type: 'SHORT_TEXT',
            required: true
          }),
          expect.objectContaining({
            name: 'Edad',
            type: 'NUMBER',
            required: true
          })
        ])
      )
    } catch (error) {
      console.error(
        'Error retrieving template by ID:',
        error.response ? error.response.data : error.message
      )
      throw error
    }
  })

  // Test para obtener una plantilla por su ID inexistente
  it('should return an error when trying to retrieve a non-existent template', async () => {
    const nonExistentTemplateId = '11s1s1a1w1' // ID no válido

    try {
      await axios.get(
        `${BASE_URL}/doctor/PatientTemplate?templateId=${nonExistentTemplateId}`,
        { headers }
      )
    } catch (error) {
      expect(error.response.status).toBe(404)
      expect(error.response.data.message).toBe(
        'No se pudo encontrar la plantilla solicitada'
      )
    }
  })
})
