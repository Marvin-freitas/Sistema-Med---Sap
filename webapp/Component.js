sap.ui.define([
	"sap/ui/core/UIComponent",
	"./model/models",
	"sap/ui/core/mvc/View"
], function (UIComponent, models, View) {
	"use strict";

	return UIComponent.extend("med.Component", {

		metadata: {
			manifest: "json",
			interfaces: ["sap.ui.core.IAsyncContentCreation"]
		},

		/**
		 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
		 * @public
		 * @override
		 */
		init: function () {
			
			UIComponent.prototype.init.apply(this, arguments);

			// set the device model
			this.setModel(models.createDeviceModel(), "device");

			
			this.getRouter().initialize();
		},
		createContent: function () {
			
			return View.create({
				viewName: "med.view.App",
				type: "XML"
			});
		}
	});
});
