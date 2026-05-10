test("Check ok status", function() {
  expect(res.getBody()).to.have.property('ok', true);
});