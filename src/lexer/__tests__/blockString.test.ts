import { dedentBlockStringLines } from '../blockString';

describe('dedentBlockStringLines', () => {
  it('handles empty string', () => {
    expect(dedentBlockStringLines([''])).toEqual([]);
  });

  it('does not dedent first line', () => {
    expect(dedentBlockStringLines(['  a'])).toEqual(['  a']);
    expect(dedentBlockStringLines([' a', '  b'])).toEqual([' a', 'b']);
  });

  it('removes minimal indentation length', () => {
    expect(dedentBlockStringLines(['', ' a', '  b'])).toEqual(['a', ' b']);
    expect(dedentBlockStringLines(['', '  a', ' b'])).toEqual([' a', 'b']);
    expect(dedentBlockStringLines(['', '  a', ' b', 'c'])).toEqual(['  a', ' b', 'c']);
  });

  it('dedent both tab and space as single character', () => {
    expect(dedentBlockStringLines(['', '\ta', '          b'])).toEqual(['a', '         b']);
    expect(dedentBlockStringLines(['', '\t a', '          b'])).toEqual(['a', '        b']);
    expect(dedentBlockStringLines(['', ' \t a', '          b'])).toEqual(['a', '       b']);
  });

  it('dedent do not take empty lines into account', () => {
    expect(dedentBlockStringLines(['a', '', ' b'])).toEqual(['a', '', 'b']);
    expect(dedentBlockStringLines(['a', ' ', '  b'])).toEqual(['a', '', 'b']);
  });

  it('removes uniform indentation from a string', () => {
    const lines = ['', '    Hello,', '      World!', '', '    Yours,', '      GraphQL.'];
    expect(dedentBlockStringLines(lines)).toEqual([
      'Hello,',
      '  World!',
      '',
      'Yours,',
      '  GraphQL.',
    ]);
  });

  it('removes empty leading and trailing lines', () => {
    const lines = [
      '',
      '',
      '    Hello,',
      '      World!',
      '',
      '    Yours,',
      '      GraphQL.',
      '',
      '',
    ];
    expect(dedentBlockStringLines(lines)).toEqual([
      'Hello,',
      '  World!',
      '',
      'Yours,',
      '  GraphQL.',
    ]);
  });

  it('removes blank leading and trailing lines', () => {
    const lines = [
      '  ',
      '        ',
      '    Hello,',
      '      World!',
      '',
      '    Yours,',
      '      GraphQL.',
      '        ',
      '  ',
    ];
    expect(dedentBlockStringLines(lines)).toEqual([
      'Hello,',
      '  World!',
      '',
      'Yours,',
      '  GraphQL.',
    ]);
  });

  it('retains indentation from first line', () => {
    const lines = ['    Hello,', '      World!', '', '    Yours,', '      GraphQL.'];
    expect(dedentBlockStringLines(lines)).toEqual([
      '    Hello,',
      '  World!',
      '',
      'Yours,',
      '  GraphQL.',
    ]);
  });

  it('does not alter trailing spaces', () => {
    const lines = [
      '               ',
      '    Hello,     ',
      '      World!   ',
      '               ',
      '    Yours,     ',
      '      GraphQL. ',
      '               ',
    ];
    expect(dedentBlockStringLines(lines)).toEqual([
      'Hello,     ',
      '  World!   ',
      '           ',
      'Yours,     ',
      '  GraphQL. ',
    ]);
  });
});
