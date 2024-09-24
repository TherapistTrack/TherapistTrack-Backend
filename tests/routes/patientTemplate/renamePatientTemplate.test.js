describe('Rename Patiente Template Tests', () => {
  beforeAll(() => {
    // TODO
    // Create a 2 doctors
  })

  afterAll(() => {
    // TODO
    // Remove patient
  })

  test('should rename with 200 a patient template correctly', async () => {
    // Create template
  })
  test("should fail with 400 to rename template if 'doctorId' is not provided", async () => {
    // Create template
  })
  test("should fail with 400 to rename template if 'templateId' is not provided", async () => {
    // Create template
  })
  test("should fail with 400 to rename template if 'name' is not provide", async () => {
    // Create template
  })
  test("should fail with 403 to rename template if 'doctorid' exist but is not the owner of this template", async () => {
    // Create template
  })
  test("should fail with 404 to rename template if 'doctorid' is not from a valid/active user", async () => {
    // Create template
  })
  test("should fail with 404 to rename template if 'template' is not from a valid/active template", async () => {
    // Create template
  })
})
