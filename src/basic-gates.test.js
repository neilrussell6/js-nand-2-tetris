const { assert } = require('chai')
const R = require('ramda')
const parametrize = require('js-parametrize')

describe('/basic-gates', () => {

  const nand = (a, b) => {
    return !(a && b) ? 1 : 0
  }

  // x Or y = (x Nand x) Nand (y Nand y)
  parametrize([
    [0,0,1],
    [0,1,1],
    [1,0,1],
    [1,1,0],
  ], (a,b,expected) => {
    it(`NAND : ${a}, ${b} = ${expected}`, () => {
      assert.equal(nand(a, b), expected)
    })
  })

  const not = (a) => {
    // return !a
    return nand(a, a)
  }

  parametrize([
    [0,1],
    [1,0],
  ], (a,expected) => {
    it(`NOT : ${a} = ${expected}`, () => {
      assert.equal(not(a), expected)
    })
  })

  const and = (a, b) => {
    // return a && b
    const c = nand(a, b)
    return not(c)
  }

  parametrize([
    [0,0,0],
    [0,1,0],
    [1,0,0],
    [1,1,1],
  ], (a,b,expected) => {
    it(`AND : ${a}, ${b} = ${expected}`, () => {
      assert.equal(and(a, b), expected)
    })
  })
  //
  // const or = (a, b) => {
  //   // return a === 1 || b === 1 ? 1 : 0
  //   // return a || b ? 1 : 0
  //   // return and(a, not(b)) || and(not(a), b) || and(a, not(b)) || and(a, b)
  //   const c = nand(a, a)
  //   const d = nand(b, b)
  //   return nand(c, d)
  // }

  const or = (a, b) => {
    // return !(!a && !b)
    // return nand(not(a), not(b))
    const c = not(a)
    const d = not(b)
    return nand(c, d)
  }

  parametrize([
    [0,0,0],
    [0,1,1],
    [1,0,1],
    [1,1,1],
  ], (a,b,expected) => {
    it(`OR : ${a}, ${b} = ${expected}`, () => {
      assert.equal(or(a, b), expected)
    })
  })

  const xor = (a, b) => {
    // return (a && !b) || (!a && b) ? 1 : 0
    // return or(and(a, not(b)), and(not(a), b))
    const nb = not(b)
    const na = not(a)
    const c = and(a, nb)
    const d = and(na, b)
    return or(c, d)
  }

  parametrize([
    [0,0,0],
    [0,1,1],
    [1,0,1],
    [1,1,0],
  ], (a,b,expected) => {
    it(`XOR : ${a}, ${b} = ${expected}`, () => {
      assert.equal(xor(a, b), expected)
    })
  })

  const mux = (a, b, sel) => {
    // return sel === 0 ? a : b
    // return !sel ? a : b

    // if (sel && !a && b) {
    //   return (sel && !a && b)
    // }
    // if (sel && a && b) {
    //   return (sel && a && b)
    // }
    // return (!sel && a)

    // return (!sel && a) || (sel && a && b) || (sel && !a && b)

    // return (!sel && a) || (sel && b)

    // return or(and(not(sel), a), and(sel, b))

    const nsel = not(sel)
    const c = and(nsel, a)
    const d = and(sel, b)
    return or(c, d)
  }

  parametrize([
    [1,0,0,0,0],
    [2,0,0,1,0],
    [3,0,1,0,0],
    [4,0,1,1,1],
    [5,1,0,0,1],
    [6,1,0,1,0],
    [7,1,1,0,1],
    [8,1,1,1,1],
  ], (i,a,b,sel,expected) => {
    it(`${i} - MUX : ${a}, ${b}, ${sel} = ${expected}`, () => {
      assert.equal(mux(a, b, sel), expected)
    })
  })


  const dmux = (input, sel) => {
    // if (input && sel) {
    //   return [0, 1]
    // }
    // if (input && !sel) {
    //   return [1, 0]
    // }
    // return [input && sel, input && sel]

    // if (input && sel) {
    //   return [!sel, input && sel]
    // }
    // if (input && !sel) {
    //   return [!sel, input && sel]
    // }
    // return [input && sel, input && sel]

    // if (input && (sel || !sel)) {
    //   return [!sel, input && sel]
    // }
    // return [input && sel, input && sel]

    // console.log(`(${sel} || !${sel})`, (sel || !sel))

    // if (!input) {
    //   return [input && !sel, input && sel]
    // }
    // return [input && !sel, input && sel]

    // return [input && !sel, input && sel]

    // return [and(input, not(sel)), and(input, sel)]

    const nsel = not(sel)
    const c = and(input, nsel)
    const d = and(input, sel)
    return [c, d]
  }

  parametrize([
    [1,0,0,0,0],
    [2,0,1,0,0],
    [3,1,0,1,0],
    [4,1,1,0,1],
  ], (i,input,sel,a,b) => {
    it(`${i} - DMUX : ${input}, ${sel} = ${a}, ${b}`, () => {
      const r = dmux(input, sel)
      assert.equal(r[0], a)
      assert.equal(r[1], b)
    })
  })

  const mux16 = (a, b, sel) => {
    // // 1
    // const out = []
    // for (let i=0; i<16; i++) {
    //   const _a = parseInt(a[i], 10)
    //   const _b = parseInt(b[i], 10)
    //   const _out = mux(_a, _b, sel)
    //   out.push(_out)
    // }
    // return R.join('', out)

    const out = [
      mux(parseInt(a[0], 10), parseInt(b[0], 10), sel),
      mux(parseInt(a[1], 10), parseInt(b[1], 10), sel),
      mux(parseInt(a[2], 10), parseInt(b[2], 10), sel),
      mux(parseInt(a[3], 10), parseInt(b[3], 10), sel),
      mux(parseInt(a[4], 10), parseInt(b[4], 10), sel),
      mux(parseInt(a[5], 10), parseInt(b[5], 10), sel),
      mux(parseInt(a[6], 10), parseInt(b[6], 10), sel),
      mux(parseInt(a[7], 10), parseInt(b[7], 10), sel),
      mux(parseInt(a[8], 10), parseInt(b[8], 10), sel),
      mux(parseInt(a[9], 10), parseInt(b[9], 10), sel),
      mux(parseInt(a[10], 10), parseInt(b[10], 10), sel),
      mux(parseInt(a[11], 10), parseInt(b[11], 10), sel),
      mux(parseInt(a[12], 10), parseInt(b[12], 10), sel),
      mux(parseInt(a[13], 10), parseInt(b[13], 10), sel),
      mux(parseInt(a[14], 10), parseInt(b[14], 10), sel),
      mux(parseInt(a[15], 10), parseInt(b[15], 10), sel),
    ]
    return R.join('', out)
  }

  describe('MUX16', () => {
    parametrize([
      [1,'0000000000000000','0000000000000000',0,'0000000000000000'],
      [2,'0000000000000000','0000000000000000',1,'0000000000000000'],
      [3,'0000000000000000','0001001000110100',0,'0000000000000000'],
      [4,'0000000000000000','0001001000110100',1,'0001001000110100'],
      [5,'1001100001110110','0000000000000000',0,'1001100001110110'],
      [6,'1001100001110110','0000000000000000',1,'0000000000000000'],
      [7,'1010101010101010','0101010101010101',0,'1010101010101010'],
      [8,'1010101010101010','0101010101010101',1,'0101010101010101'],
    ], (i,a,b,sel,out) => {
      it(`${i} - MUX16 : ${a}, ${b}, ${sel} = ${out}`, () => {
        const r = mux16(a, b, sel)
        assert.equal(r, out)
      })
    })
  })

  const or8way = (input) => {
    // let out = 0
    // out = or(0, parseInt(input[0], 10))
    // out = or(out, parseInt(input[1], 10))
    // out = or(out, parseInt(input[2], 10))
    // out = or(out, parseInt(input[3], 10))
    // out = or(out, parseInt(input[4], 10))
    // out = or(out, parseInt(input[5], 10))
    // out = or(out, parseInt(input[6], 10))
    // out = or(out, parseInt(input[7], 10))
    // return out

    const a = or(parseInt(input[0], 10), parseInt(input[1], 10))
    const b = or(parseInt(input[2], 10), parseInt(input[3], 10))
    const c = or(parseInt(input[4], 10), parseInt(input[5], 10))
    const d = or(parseInt(input[6], 10), parseInt(input[7], 10))
    const e = or(a, b)
    const f = or(c, d)
    const out = or(e, f)
    return out
  }

  describe('OR 8WAY', () => {
    parametrize([
      ['00000000',0],
      ['11111111',1],
      ['00010000',1],
      ['00000001',1],
      ['00100110',1],
    ], (a,out) => {
      it(`OR 8WAY : ${a} = ${out}`, () => {
        const r = or8way(a)
        assert.equal(r, out)
      })
    })
  })

  const mux4way16 = (a, b, c, d, sel) => {
    // // 1
    // const _sel0 = parseInt(sel[0], 10)
    // const _sel1 = parseInt(sel[1], 10)
    // if (!_sel0 && !_sel1) {
    //   return a
    // }
    // if (!_sel0 && _sel1) {
    //   return b
    // }
    // if (_sel0 && !_sel1) {
    //   return c
    // }
    // if (_sel0 && _sel1) {
    //   return d
    // }

    // // 2
    // const _sel0 = parseInt(sel[0], 10)
    // const _sel1 = parseInt(sel[1], 10)
    // const w = !_sel0 && !_sel1
    // const x = !_sel0 && _sel1
    // const y = _sel0 && !_sel1
    // const z = _sel0 && _sel1
    // const _a = mux16(0, a, w)
    // const _b = mux16(_a, b, x)
    // const _c = mux16(_b, c, y)
    // const _d = mux16(_c, d, z)
    // return _d

    // // 3
    // const sel0 = parseInt(sel[0], 10)
    // const sel1 = parseInt(sel[1], 10)
    // const nsel0 = not(sel0)
    // const nsel1 = not(sel1)
    // const w = and(nsel0, nsel1)
    // const x = and(nsel0, sel1)
    // const y = and(sel0, nsel1)
    // const z = and(sel0, sel1)
    // const xa = mux16(a, a, w)
    // const xb = mux16(xa, b, x)
    // const xc = mux16(xb, c, y)
    // const out = mux16(xc, d, z)
    // return out

    // 4 ryan/matt
    const sel0 = parseInt(sel[0], 10)
    const sel1 = parseInt(sel[1], 10)
    const muxAB = mux16(a, b, sel1)
    const muxCD = mux16(c, d, sel1)
    const out = mux16(muxAB, muxCD, sel0)
    return out
  }

  describe('MUX 4WAY 16', () => {
    parametrize([
      [1, '0000000000000000','0000000000000000','0000000000000000','0000000000000000','00','0000000000000000'],
      [2, '0000000000000000','0000000000000000','0000000000000000','0000000000000000','01','0000000000000000'],
      [3, '0000000000000000','0000000000000000','0000000000000000','0000000000000000','10','0000000000000000'],
      [4, '0000000000000000','0000000000000000','0000000000000000','0000000000000000','11','0000000000000000'],
      [5, '0001001000110100','1001100001110110','1010101010101010','0101010101010101','00','0001001000110100'],
      [6, '0001001000110100','1001100001110110','1010101010101010','0101010101010101','01','1001100001110110'],
      [7, '0001001000110100','1001100001110110','1010101010101010','0101010101010101','10','1010101010101010'],
      [8, '0001001000110100','1001100001110110','1010101010101010','0101010101010101','11','0101010101010101'],
    ], (i,a,b,c,d,sel,out) => {
      it(`${i} - MUX 4WAY 16 : ${a}, ${b}, ${c}, ${d}, ${sel} = ${out}`, () => {
        const r = mux4way16(a, b, c, d, sel)
        assert.equal(r, out)
      })
    })
  })

  const mux8way16 = (a,b,c,d,e,f,g,h,sel) => {
    const sel0 = parseInt(sel[0], 10)
    const sel1 = parseInt(sel[1], 10)
    const sel2 = parseInt(sel[2], 10)

    const c1 = mux4way16(a,b,c,d,`${sel0}${sel1}`)
    const c2 = mux4way16(e,f,g,h,`${sel0}${sel1}`)

    const out = mux16(c1,c2,sel2)
    console.log(e,f,g,h,`${sel0}${sel1}`)
    console.log(c1,c2,sel2)
    console.log(out)

    return out
  }

  // TODO: get this working
  describe.skip('MUX 4WAY 16', () => {
    parametrize([
      [1, '0000000000000000','0000000000000000','0000000000000000','0000000000000000','0000000000000000','0000000000000000','0000000000000000','0000000000000000','000','0000000000000000'],
      [2, '0000000000000000','0000000000000000','0000000000000000','0000000000000000','0000000000000000','0000000000000000','0000000000000000','0000000000000000','001','0000000000000000'],
      [3, '0000000000000000','0000000000000000','0000000000000000','0000000000000000','0000000000000000','0000000000000000','0000000000000000','0000000000000000','010','0000000000000000'],
      [4, '0000000000000000','0000000000000000','0000000000000000','0000000000000000','0000000000000000','0000000000000000','0000000000000000','0000000000000000','011','0000000000000000'],
      [5, '0000000000000000','0000000000000000','0000000000000000','0000000000000000','0000000000000000','0000000000000000','0000000000000000','0000000000000000','100','0000000000000000'],
      [6, '0000000000000000','0000000000000000','0000000000000000','0000000000000000','0000000000000000','0000000000000000','0000000000000000','0000000000000000','101','0000000000000000'],
      [7, '0000000000000000','0000000000000000','0000000000000000','0000000000000000','0000000000000000','0000000000000000','0000000000000000','0000000000000000','110','0000000000000000'],
      [8, '0000000000000000','0000000000000000','0000000000000000','0000000000000000','0000000000000000','0000000000000000','0000000000000000','0000000000000000','111','0000000000000000'],
      [9, '0001001000110100','0010001101000101','0011010001010110','0100010101100111','0101011001111000','0110011110001001','0111100010011010','1000100110101011','000','0001001000110100'],
      [10,'0001001000110100','0010001101000101','0011010001010110','0100010101100111','0101011001111000','0110011110001001','0111100010011010','1000100110101011','001','0010001101000101'],
      [11,'0001001000110100','0010001101000101','0011010001010110','0100010101100111','0101011001111000','0110011110001001','0111100010011010','1000100110101011','010','0011010001010110'],
      [12,'0001001000110100','0010001101000101','0011010001010110','0100010101100111','0101011001111000','0110011110001001','0111100010011010','1000100110101011','011','0100010101100111'],
      [13,'0001001000110100','0010001101000101','0011010001010110','0100010101100111','0101011001111000','0110011110001001','0111100010011010','1000100110101011','100','0101011001111000'],
      [14,'0001001000110100','0010001101000101','0011010001010110','0100010101100111','0101011001111000','0110011110001001','0111100010011010','1000100110101011','101','0110011110001001'],
      [15,'0001001000110100','0010001101000101','0011010001010110','0100010101100111','0101011001111000','0110011110001001','0111100010011010','1000100110101011','110','0111100010011010'],
      [16,'0001001000110100','0010001101000101','0011010001010110','0100010101100111','0101011001111000','0110011110001001','0111100010011010','1000100110101011','111','1000100110101011'],
    ], (i,a,b,c,d,e,f,g,h,sel,out) => {
      it(`${i} - MUX 8WAY 16 : ${a}, ${b}, ${c}, ${d}, ${e}, ${f}, ${g}, ${h}, ${sel} = ${out}`, () => {
        const r = mux8way16(a,b,c,d,e,f,g,h,sel)
        assert.equal(r, out)
      })
    })
  })

  const f1 = (x, y, z) => {
    return (x || y) && !z
  }

  const f2 = (x, y, z) => {
    return and(or(x, y), not(z))
  }

  describe('f(x,y,z) = (x + y) . !z', () => {
    // f(x,y,z) = (x + y) . !z
    // f(x,y,z) = (x OR y) AND NOT z
    // f(x,y,z) = (x || y) && !z
    // f(x,y,z) = and(and(x, y), not(z))
    parametrize([
      [0,0,0,0],
      [0,0,1,0],
      [0,1,0,1],
      [0,1,1,0],
      [1,0,0,1],
      [1,0,1,0],
      [1,1,0,1],
      [1,1,1,0],
    ], (x,y,z,expected) => {
      it(`${x}, ${y}, ${z} = ${expected}`, () => {
        assert.equal(f1(x,y,z), expected)
        assert.equal(f2(x,y,z), expected)
      })
    })
  })
})
