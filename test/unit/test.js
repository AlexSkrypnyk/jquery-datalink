/**
 * @file
 * QUnit tests.
 */

(function () {
  /**
   * Asserts field values allowing all events to fire beforehand.
   */
  QUnit.assert.fieldValues = function (cb, timeout) {
    timeout = timeout || 1;
    stop();
    setTimeout(function () {
      cb();
      start();
    }, timeout);
  };

  /**
   * Helper to get value from an element.
   */
  $.fn.getValue = function () {
    return $(this).is('input, textarea') ? $(this).val() : $(this).html();
  };

  /**
   * Generate random string with n characters of length.
   */
  var randomString = function (n) {
    return new Array(n).join().replace(/(.|$)/g, function () {
      return ((Math.random() * 36) | 0).toString(36);
    })
  };

  QUnit.module('Direct connection');

  test('Input - keyboard', function (assert) {
    var value = randomString(5),
      $src = $('#text1'),
      $dst = $('#text2');

    assert.equal($src.getValue(), '', 'Source is empty before linking');
    assert.equal($dst.getValue(), '', 'Destination is empty before linking');

    $dst.datalink($src);

    assert.equal($src.getValue(), '', 'Source is empty after linking');
    assert.equal($dst.getValue(), '', 'Destination is empty after linking');

    $src.simulate('key-sequence', {sequence: value});

    assert.fieldValues(function () {
      assert.equal($src.getValue(), value, 'Source has been changed after event was triggered');
      assert.equal($dst.getValue(), value, 'Destination is equal to source after event was triggered');
    });
  });

  test('Input - val()', function (assert) {
    var value = randomString(5),
      $src = $('#text1'),
      $dst = $('#text2');

    assert.equal($src.getValue(), '', 'Source is empty before linking');
    assert.equal($dst.getValue(), '', 'Destination is empty before linking');

    $dst.datalink($src);

    assert.equal($src.getValue(), '', 'Source is empty after linking');
    assert.equal($dst.getValue(), '', 'Destination is empty after linking');

    $src.val(value);

    assert.fieldValues(function () {
      assert.equal($src.getValue(), value, 'Source has been changed after event was triggered');
      assert.equal($dst.getValue(), value, 'Destination is equal to source after event was triggered');
    });
  });

  test('Input chain - val()', function (assert) {
    var value = randomString(5),
      $src = $('#text1'),
      $dst = $('#text2');
    $dst2 = $('#text3');

    assert.equal($src.getValue(), '', 'Source is empty before linking');
    assert.equal($dst.getValue(), '', 'Destination is empty before linking');
    assert.equal($dst2.getValue(), '', 'Destination2 is empty before linking');

    $dst.datalink($src);
    $dst2.datalink($dst);

    assert.equal($src.getValue(), '', 'Source is empty after linking');
    assert.equal($dst.getValue(), '', 'Destination is empty after linking');
    assert.equal($dst2.getValue(), '', 'Destination2 is empty after linking');

    $src.val(value);

    assert.fieldValues(function () {
      assert.equal($src.getValue(), value, 'Source has been changed after event was triggered');
      assert.equal($dst.getValue(), value, 'Destination is equal to source after event was triggered');
      assert.equal($dst2.getValue(), value, 'Destination2 is equal to source after event was triggered');
    });
  });

  test('Input multisource - val()', function (assert) {
    var value1 = randomString(5),
      value2 = randomString(5),
      $src = $('#text1'),
      $src2 = $('#text2'),
      $dst = $('#text3');

    assert.equal($src.getValue(), '', 'Source is empty before linking');
    assert.equal($src2.getValue(), '', 'Source2 is empty before linking');
    assert.equal($dst.getValue(), '', 'Destination is empty before linking');

    $dst.datalink($src.add($src2));

    assert.equal($src.getValue(), '', 'Source is empty after linking');
    assert.equal($src2.getValue(), '', 'Source is empty after linking');
    assert.equal($dst.getValue(), '', 'Destination is empty after linking');

    $src.val(value1);

    assert.equal($src.getValue(), value1, 'Source has been changed after event was triggered');
    assert.equal($src2.getValue(), '', 'Source2 has not been changed after event was triggered');
    assert.equal($dst.getValue(), value1, 'Destination is equal to source after event was triggered');

    $src2.val(value2);

    assert.fieldValues(function () {
      assert.equal($src.getValue(), value1, 'Source has not been changed after event was triggered');
      assert.equal($src2.getValue(), value2, 'Source2 has been changed after event was triggered');
      assert.equal($dst.getValue(), value2, 'Destination is equal to source 2 after event was triggered');
    });
  });

  test('Input multisource - val()', function (assert) {
    var value = randomString(5),
      $src = $('#text1'),
      $dst = $('#text3'),
      $dst2 = $('#text4');

    assert.equal($src.getValue(), '', 'Source is empty before linking');
    assert.equal($dst.getValue(), '', 'Destination is empty before linking');
    assert.equal($dst2.getValue(), '', 'Destination2 is empty before linking');

    $dst.datalink($src);
    $dst2.datalink($dst);

    assert.equal($src.getValue(), '', 'Source is empty after linking');
    assert.equal($dst.getValue(), '', 'Destination is empty after linking');
    assert.equal($dst2.getValue(), '', 'Destination2 is empty after linking');

    $src.val(value);

    assert.fieldValues(function () {
      assert.equal($src.getValue(), value, 'Source has been changed after event was triggered');
      assert.equal($dst.getValue(), value, 'Destination is equal to source after event was triggered');
      assert.equal($dst2.getValue(), value, 'Destination2 is equal to source after event was triggered');
    });
  });

  test('Container', function (assert) {
    var value = randomString(5),
      $src = $('#container1'),
      $dst = $('#container2');

    assert.equal($src.getValue(), '', 'Source is empty before linking');

    assert.equal($src.getValue(), '', 'Source is empty before linking');
    assert.equal($dst.getValue(), '', 'Destination is empty before linking');

    $dst.datalink($src);

    assert.equal($src.getValue(), '', 'Source is empty after linking');
    assert.equal($dst.getValue(), '', 'Destination is empty after linking');

    $src.html(value);

    assert.fieldValues(function () {
      assert.equal($src.getValue(), value, 'Source has been changed after event was triggered');
      assert.equal($dst.getValue(), value, 'Destination is equal to source after event was triggered');
    });
  });

  test('Container chain', function (assert) {
    var value = randomString(5),
      $src = $('#container1'),
      $dst = $('#container2'),
      $dst2 = $('#container3');

    assert.equal($src.getValue(), '', 'Source is empty before linking');
    assert.equal($dst.getValue(), '', 'Destination is empty before linking');
    assert.equal($dst2.getValue(), '', 'Destination2 is empty before linking');

    $dst.datalink($src);
    $dst2.datalink($dst);

    assert.equal($src.getValue(), '', 'Source is empty after linking');
    assert.equal($dst.getValue(), '', 'Destination is empty after linking');
    assert.equal($dst2.getValue(), '', 'Destination2 is empty after linking');

    $src.html(value);

    assert.fieldValues(function () {
      assert.equal($src.getValue(), value, 'Source has been changed after event was triggered');
      assert.equal($dst.getValue(), value, 'Destination is equal to source after event was triggered');
      assert.equal($dst2.getValue(), value, 'Destination2 is equal to source after event was triggered');
    });
  });

  QUnit.module('Event');
  // Test that all parameters passed to event handler have expected values.
  test('Parameters', function (assert) {
    var value1 = randomString(5),
      $src = $('#text1'),
      $src2 = $('#text2'),
      $dst = $('#text3'),
      $set,
      $changed;

    $set = $src.add($src2);
    $changed = $src2;

    // (current + updated + trackedValues) * 2 fields and values.
    assert.expect(2 * (1 + 1 + $set.length));

    $dst.datalink($set, function (currentValue, updatedTrackedValue, trackedValues, $currentField, $updatedTrackedField, $trackedFields) {
      assert.equal(currentValue, '', 'currentValue');
      assert.equal(updatedTrackedValue, value1, 'updatedTrackedValue');

      for (var i = 0; i < trackedValues.length; i++) {
        assert.equal(trackedValues[i], $set.eq(i).getValue(), 'trackedValues (' + i + ')');
      }

      //assert.equal($currentField, $dst);
      assert.equal($currentField.attr('id'), $dst.attr('id'), '$currentField');
      assert.equal($updatedTrackedField.attr('id'), $changed.attr('id'), '$updatedTrackedField');
      $trackedFields.each(function (idx) {
        assert.equal($(this).attr('id'), $set.eq(idx).attr('id'), '$trackedFields (' + idx + ')');
      });

      return updatedTrackedValue;
    });

    $changed.val(value1);
  });

  test('Parameters - multiple invocations', function (assert) {
    var value1 = randomString(5),
      $src = $('#text1'),
      $src2 = $('#text2'),
      $dst = $('#text3'),
      $set,
      $changed,
      lastValue;

    $set = $src.add($src2);

    $dst.datalink($set, function (currentValue, updatedTrackedValue, trackedValues, $currentField, $updatedTrackedField, $trackedFields) {
      assert.equal(currentValue, lastValue, 'currentValue');
      assert.equal(updatedTrackedValue, value1, 'updatedTrackedValue');
      for (var i = 0; i < trackedValues.length; i++) {
        assert.equal(trackedValues[i], $set.eq(i).getValue(), 'trackedValues (' + i + ')');
      }

      assert.equal($currentField.attr('id'), $dst.attr('id'), '$currentField');
      assert.equal($updatedTrackedField.attr('id'), $changed.attr('id'), '$updatedTrackedField');
      $trackedFields.each(function (idx) {
        assert.equal($(this).attr('id'), $set.eq(idx).attr('id'), '$trackedFields (' + idx + ')');
      });

      return updatedTrackedValue;
    });

    // Invoke multiple value setting.
    lastValue = '';
    $changed = $src;
    $changed.val(value1);

    lastValue = value1;
    $changed = $src2;
    $changed.val(value1);

    // (current + updated + trackedValues) * 2 fields and values * 2 invocations
    assert.expect(2 * 2 * (1 + 1 + $set.length));
  });

  QUnit.module('Dependencies');
  test('jQuery Observe', function (assert) {
    var existingPlugin = $.fn['observe'];
    delete $.fn['observe'];
    assert.throws(function () {
      $('#text1').datalink($('#text2'));
    }, 'Please install jquery-observer plugin', 'Missing jQuery-observer dependency throws an exception');
    $.fn['observe'] = existingPlugin;
  });
}());
