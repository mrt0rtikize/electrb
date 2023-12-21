function parse(data) {
  const length = data.readInt32LE(6);
  const type = data.readInt32LE(10);
  const payload = JSON.parse(data.toString('utf8', 14, 14 + length));
  return { type, length, payload };
}

module.exports = parse;
