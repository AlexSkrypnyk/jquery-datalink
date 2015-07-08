/**
 * @@title
 * @@description
 *
 * Version: @@version
 * Author: @@author_name (@@author_email)
 * License: @@license
 *
 * @usage
 *
 * ----------    ----------
 * | #a     | => | #b     |
 * ----------    ----------
 *  $('#b').datalink($('#a'));
 *
 * ----------   ----------   ----------
 * | #a     | + | #b     | = | #c     |
 * ----------   ----------   ----------
 *
 *  $('#c').datalink($('#a, #b'), function (currentValue, trackedValues) {
 *    var sum = 0;
 *    $.each(trackedValues, function () {
 *      sum += parseInt(this, 10);
 *    });
 *    return sum;
 *  });
 */

(function ($, window, undefined) {
  var pluginName = 'datalink',
    version = '@@version',
    EVENT_UPDATE = 'datalink:change';

  function Plugin(element, args, existingPlugin) {
    this.name = pluginName;
    this.version = version;

    this.defaults = {
      callback: this.callbackBindEqual,
      callbackArgs: []
    };

    this.$element = $(element);

    this.initSettings(args, existingPlugin);

    // Check that dependencies are met.
    this.checkDependencies();

    this.init();
  }

  $.extend(Plugin.prototype, {
    init: function () {
      // Traverse through all field settings and bind tracking to elements.
      for (var i in this.settings) {
        if (this.settings.hasOwnProperty(i)) {
          this.bindToElement(this.settings[i]);
        }
      }
    },

    /**
     * Check that dependencies are met and throw errors for each unmet ones.
     */
    checkDependencies: function () {
      if ($.fn.observe === undefined) {
        throw 'Please install jquery-observer plugin';
      }
    },

    /**
     * Init settings from arguments and previously bound plugin instances.
     *
     * @param args
     *   Arguments, initially passed to the plugin constructor.
     * @param existingPlugin
     *   Existing plugin, initially passed to the plugin constructor.
     */
    initSettings: function (args, existingPlugin) {
      var options = {},
        optionsArgs = {};

      // Convert arguments to array.
      args = this.argumentsToArray(args);

      // Parse plugin arguments from a list of provided arguments.
      // Fields.
      if (args.length > 0) {
        optionsArgs.fields = args[0];
        args = args.slice(1);
      }
      else {
        throw 'Target fields argument is required';
      }

      // Callback.
      if (args.length > 0 && $.isFunction(args[0])) {
        optionsArgs.callback = args[0];
        args = args.slice(1);
      }

      // Callback args. Can be an array of callback args or a callback to
      // return an array of callback args.
      if (args.length > 0 && ($.isArray(args[0]) || $.isFunction(args[0]))) {
        optionsArgs.callbackArgs = args[0];
        args = args.slice(1);
      }

      if (args.length > 0 && $.isPlainObject(args[0])) {
        options = args[0];
      }

      // Resolve settings for current and all previous instances of this plugin.
      this.normaliseSettings($.extend(true, {}, this.defaults, optionsArgs, options), existingPlugin);
    },

    /**
     * Normalise settings into expected format.
     *
     * Recursively used for existing plugin instance settings.
     *
     * @param singleSettings
     *   Settings for a single field.
     * @param existingPlugin
     *   Existing plugin instance or null if no previous instance was bound
     *   to the field.
     */
    normaliseSettings: function (singleSettings, existingPlugin) {
      var self = this, $fields, i;
      // Get fields to work on: either from settings or from previously
      // normalised settings of existing instance.
      $fields = 'fields' in singleSettings ? singleSettings.fields : $(singleSettings.field);

      $fields.each(function () {
        self.setSettingForField(this, singleSettings);
      });

      // Recursively normalise existing plugin settings, if provided.
      if (existingPlugin) {
        for (i in existingPlugin.settings) {
          if (existingPlugin.settings.hasOwnProperty(i)) {
            self.normaliseSettings(existingPlugin.settings[i]);
          }
        }
      }
    },

    /**
     * Get settings for specified field and a callback.
     */
    getSettingsForField: function (field, callback) {
      this.settings = this.settings || [];
      var i, s;
      for (i in this.settings) {
        if (this.settings.hasOwnProperty(i)) {
          s = this.settings[i];
          if (s.field === field && s.callback === callback) {
            return this.settings[i];
          }
        }
      }

      return null;
    },

    /**
     * Set field settings.
     */
    setSettingForField: function (field, singleSettings) {
      this.settings = this.settings || [];
      var existingSettings = this.getSettingsForField(field, singleSettings.callback),
        s;
      if (!existingSettings) {
        s = $.extend({}, singleSettings);
        delete s.fields;
        s.field = field;
        this.settings.push(s);
      }
    },

    /**
     * Get fields with similar callback.
     */
    getFieldsWithCallback: function (callback) {
      this.settings = this.settings || [];
      var $set = $(), i, s;
      for (i in this.settings) {
        if (this.settings.hasOwnProperty(i)) {
          s = this.settings[i];
          if (s.callback === callback) {
            $set = $set.add($(s.field));
          }
        }
      }
      return $set;
    },

    /**
     * Default binding callback.
     *
     * @see bindToElement()
     */
    callbackBindEqual: function (currentValue, updatedTrackedValue, trackedValues, $currentField, $updatedTrackedField, $trackedFields) {
      return updatedTrackedValue;
    },

    /**
     * Bind tracking to the specific field.
     */
    bindToElement: function (fieldSettings) {
      var self = this,
        $currentFieldToTrack = $(fieldSettings.field),
        $fieldsToTrack = self.getFieldsWithCallback(fieldSettings.callback);

      if ($fieldsToTrack.is('input, textare')) {
        $fieldsToTrack.on('input keyup', function (evt) {
          $(this).trigger(EVENT_UPDATE);
        });
      }
      else {
        $fieldsToTrack.observe('characterdata subtree added removed', function (record) {
          $(this).trigger(EVENT_UPDATE);
        });

      }

      // Use currently tracked field to bind event handler to.
      $currentFieldToTrack.on(EVENT_UPDATE, function (evt) {
        var $updatedTrackedField = $(this),
          callbackArgs = [],
          callbackResult;

        // Prepare callback arguments and dispatch the callback.
        // Arguments list (values and corresponding fields):
        // - currentValue - value of the field that will be updated.
        // - updatedTrackedValue - value of the tracked field that has just been
        //   updated.
        // - trackedValues - array of all tracked values from all tracked
        //   fields. In case of only 1 tracked field, this array will consist of
        //   value of updatedTrackedValue.
        // - $currentField - the field that will be updated.
        // - $updatedTrackedField - the tracked field that has just been
        //   updated.
        // - $trackedFields - jQuery array of all tracked fields. In case of
        //   only 1 tracked field, this array will consist of
        //   $updatedTrackedField.
        //
        // Value of the field that will be updated. Changing this value will not
        // change the original value.
        callbackArgs.push(self.getFieldValues(self.$element).pop());
        // Value of the tracked field that has just been updated.
        callbackArgs.push(self.getFieldValues($updatedTrackedField).pop());
        // Array of all tracked values from all tracked fields.
        callbackArgs.push(self.getFieldValues($fieldsToTrack));
        // The field that will be updated. This field should not be updated
        // directly as callback result will set it's value, however it is
        // possible to change it and return null from callback (see below).
        callbackArgs.push(self.$element);
        // The tracked field that has just been updated.
        callbackArgs.push($updatedTrackedField);
        // jQuery array of all tracked fields.
        callbackArgs.push($fieldsToTrack);
        // Additional callback arguments from settings.
        callbackArgs = $.merge(callbackArgs, fieldSettings.callbackArgs);

        // Dispatch callback and assign values to element field, but only
        // if callback result is not null.
        // Using null in callback result is useful when callback manipulates
        // some objects outside of this plugin's context. This should be
        // avoided, but sometimes necessary.
        callbackResult = fieldSettings.callback.apply(self, callbackArgs);
        if (callbackResult !== null) {
          self.setFieldsValue(self.$element, callbackResult);
        }
      });
    },

    /**
     * Set a value for specified field (field type agnostic).
     */
    setFieldsValue: function ($fields, value) {
      $fields.each(function () {
        var $field = $(this);
        if ($field.prop('tagName').toLowerCase() === 'input') {
          $field.val(value.toString());
        }
        else {
          $field.html(value.toString());
        }
      });
    },

    /**
     * Get values from specified field (field type agnostic).
     */
    getFieldValues: function ($fields) {
      var values = [];

      $fields.each(function () {
        var $field = $(this);
        values.push($field.is('input, textarea') ? $field.val() : $field.html());
      });
      return values;
    },

    /**
     * Helper to convert function arguments to an array.
     */
    argumentsToArray: function (args) {
      return [].slice.apply(args);
    },

    /**
     * 32-bit integer hash code of the provided string.
     */
    hashCode: function (s) {
      /*jslint bitwise: true */
      return s.split('').reduce(function (a, b) {
        a = ((a << 5) - a) + b.charCodeAt(0);
        return a & a;
      }, 0);
      /*jslint bitwise: false */
    }
  });

  // Create plugin in jQuery namespace.
  $.fn[pluginName] = function () {
    // Get all arguments to pass it to the constructor.
    var args = arguments;
    this.each(function () {
      // Since this plugin maybe applied to the same element multiple times,
      // we need to pass existing plugin instance to new instance to resolve
      // any existing bindings and settings.
      $.data(this, 'plugin_' + pluginName, new Plugin(this, args, $.data(this, 'plugin_' + pluginName)));
    });

    return this;
  };

  /**
   * Override jQuery.fn.val to trigger datalink event.
   */
  (function () {
    var originalVal = $.fn.val;
    $.fn.val = function () {
      var result = originalVal.apply(this, arguments);
      if (arguments.length > 0) {
        $(this).trigger(EVENT_UPDATE);
      }
      return result;
    };
  }());

}(jQuery, window));

