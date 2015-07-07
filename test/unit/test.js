/**
 * @file
 * QUnit tests.
 */

(function () {
  $.fn.getValue = function(){
    return $(this).prop('tagName').toLowerCase() === 'input' ? $(this).val() : $(this).html();
  };

  test('Direct connection - input', function (assert) {
    var value = 'a',
      $src = $('#text1'),
      $dst = $('#text2');

    assert.equal($src.getValue(), '', 'Source is empty before linking');
    assert.equal($dst.getValue(), '', 'Destination is empty before linking');

    $dst.datalink('keyup', $src);

    assert.equal($src.getValue(), '', 'Source is empty after linking');
    assert.equal($dst.getValue(), '', 'Destination is empty after linking');

    $src.simulate('key-sequence', {sequence: value});

    //$src.val('a');

    assert.equal($src.getValue(), value, 'Source has been changed after event was triggered');
    assert.equal($dst.getValue(), $src.getValue(), 'Destination is equal to source after event was triggered');
  });

  test('Direct connection - container', function (assert) {
    var value = 'b',
      $src = $('#container1'),
      $dst = $('#container2');


    assert.equal($src.getValue(), '', 'Source is empty before linking');

    assert.equal($src.getValue(), '', 'Source is empty before linking');
    assert.equal($dst.getValue(), '', 'Destination is empty before linking');

    $dst.datalink('change input', $src);

    assert.equal($src.getValue(), '', 'Source is empty after linking');
    assert.equal($dst.getValue(), '', 'Destination is empty after linking');

    //$src.simulate('key-sequence', {sequence: value});

    //$src.text(value).trigger('change');
    $src.text(value);

    assert.equal($src.getValue(), value, 'Source has been changed after event was triggered');
    assert.equal($dst.getValue(), $src.getValue(), 'Destination is equal to source after event was triggered');
  });



  test('Direct connection - container', function (assert) {
    var value = 'c',
      $src = $('#text3'),
      $dst = $('#container3');

    assert.equal($src.getValue(), '', 'Source is empty before linking');

    assert.equal($src.getValue(), '', 'Source is empty before linking');
    assert.equal($dst.getValue(), '', 'Destination is empty before linking');

    $dst.datalink('input keyup', $src);

    assert.equal($src.getValue(), '', 'Source is empty after linking');
    assert.equal($dst.getValue(), '', 'Destination is empty after linking');

    $src.simulate('key-sequence', {sequence: value});

    assert.equal($src.getValue(), value, 'Source has been changed after event was triggered');
    assert.equal($dst.getValue(), $src.getValue(), 'Destination is equal to source after event was triggered');
  });

}());
