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
    version = '@@version';

  function Plugin(element, args, existingPlugin) {
    this.defaults = {
      eventType: 'input',
      callback: this.callbackEqual,
      callbackArgs: []
    };

    this.name = pluginName;
    this.element = element;
    this.$element = $(element);
    this.version = version;

    this.initSettings(args, existingPlugin);

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
      //
      // Event type.
      if (typeof args[0] === 'string') {
        optionsArgs.eventType = args[0];
        args = args.slice(1);
      }

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
      var self = this,
      // Get fields to work on: either from settings or from previously
      // normalised settings of existing instance.
        $fields = 'fields' in singleSettings ? singleSettings.fields : $(singleSettings.field),
        i;

      $fields.each(function () {
        self.setSettingForField(this, singleSettings);
      });

      // Recursively normalise existing plugin settings, if provided.
      if (existingPlugin) {
        for (i in existingPlugin.settings) {
          self.normaliseSettings(existingPlugin.settings[i]);
        }
      }
    },

    /**
     * Get settings for specified event type, field and a callback.
     */
    getSettingsForField: function (eventType, field, callback) {
      this.settings = this.settings || [];
      var i, s;
      for (i in this.settings) {
        if (this.settings.hasOwnProperty(i)) {
          s = this.settings[i];
          if (s.eventType === eventType && s.field === field && s.callback === callback) {
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
      var existingSettings = this.getSettingsForField(singleSettings.eventType, field, singleSettings.callback),
        s;
      if (!existingSettings) {
        s = $.extend({}, singleSettings);
        delete s.fields;
        s.field = field;
        this.settings.push(s);
      }
    },

    /**
     * Get fields for specific event type.
     */
    getFieldsForEventType: function (eventType, callback) {
      this.settings = this.settings || [];
      var $set = $(), i, s;
      for (i in this.settings) {
        s = this.settings[i];
        if (s.eventType === eventType && s.callback === callback) {
          $set = $set.add($(s.field));
        }
      }
      return $set;
    },

    /**
     * Default binding callback.
     *
     * By default, 4 parameters are available:
     * - currentValue: Current field value.
     * - trackedValues: Tracked fields values.
     * - $currentField: Current field object.
     * - $trackedFields: Tracked fields object.
     */
    callbackEqual: function (currentValue, trackedValues) {
      return trackedValues.length > 0 ? trackedValues[0] : '';
    },

    /**
     * Bind tracking to the specific field.
     */
    bindToElement: function (fieldSettings) {
      var self = this,
        maxRedispatchCount = 20,
        $currentFieldToTrack = $(fieldSettings.field),
        $fieldsToTrack = self.getFieldsForEventType(fieldSettings.eventType, fieldSettings.callback);

      // Use currently tracked field to bind event handler to.
      $currentFieldToTrack.on(fieldSettings.eventType, function (evt, redispatchCount) {
        var updatedField = this,
          callbackArgs = [],
          callbackResult;

        redispatchCount = redispatchCount || 0;

        // Prepare callback arguments and dispatch the callback.
        // Currently updated field values.
        callbackArgs.push(self.getFieldValues($(updatedField)));
        // All tracked field values, including currently updated one. They do
        // not participate in binding, but need to be passed to the callback.
        callbackArgs.push(self.getFieldValues($fieldsToTrack));
        // Currently updated field object.
        callbackArgs.push($(updatedField));
        // All tracked field objects.
        callbackArgs.push($fieldsToTrack);
        // Additional callback arguments.
        callbackArgs = $.merge(callbackArgs, fieldSettings.callbackArgs);
        // Dispatch callback and assign values to element field, but only
        // if callback result is not null.
        // Using null in callback result is useful when callback manipulates
        // some objects outside of this plugin's context. This should be
        // avoided, but sometime necessary.
        callbackResult = fieldSettings.callback.apply(self, callbackArgs);
        if (callbackResult !== null) {
          self.setFieldsValue(self.$element, callbackResult);
        }

        // Prevent circular event triggering.
        if (redispatchCount < maxRedispatchCount) {
          self.$element.trigger(fieldSettings.eventType, [++redispatchCount]);
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
        if ($field.prop('tagName').toLowerCase() === 'input') {
          values.push($field.val());
        }
        else {
          values.push($field.html());
        }
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
    },

    /**
     * Debounce helper to track callbacks execution for triggered events.
     *
     * @param func
     *   Function to execute.
     * @returns
     *   Debounced function or null if function was already added.
     */
    debounce: function (func) {
      var self = this,
        funcHash = self.hashCode(func.toString());

      if (!window.queue) {
        window.queue = [];
      }

      if (window.queue.indexOf(funcHash) === -1) {
        window.queue.push(funcHash);

        return function () {
          return func.apply(this, arguments);
        };
      }
      else {
        return null;
      }
    }
  });

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
}(jQuery, window));
