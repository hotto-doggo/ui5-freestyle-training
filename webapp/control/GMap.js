sap.ui.define(["sap/ui/core/XMLComposite"], function (XMLComposite) {
	"use strict";

	return XMLComposite.extend("manage.company.control.GMap", {
		metadata: {
			properties: {
				markers: { type: "object", defaultValue: [] },
				mapType: { type: "string", defaultValue: "Global" },
			},
		},

		onAfterRendering: function () {
			var sMapType = this.getMapType();

			if (sMapType === "Global") {
				this.insertMap();
				this.insertGlobalMapMarkers();
			} else if (sMapType === "FlightRoute") {
				this.insertMap();
				this.insertFlightPolyline();
			}
		},

		insertMap: function () {
			this.oGeocoder = new google.maps.Geocoder();
			window.mapOptions = {
				center: new google.maps.LatLng(0, 0),
				zoom: 2,
				mapTypeId: google.maps.MapTypeId.ROADMAP,
			};

			this.oMap = new google.maps.Map(this.byId("id_GMapContainer").getDomRef(), mapOptions);
		},

		insertGlobalMapMarkers: function () {
			var aMarkers = this.getMarkers();

			var aMapMarkers = aMarkers.map((sMarker) => {
				return new google.maps.Marker({
					position: new google.maps.LatLng(sMarker.lat, sMarker.lon),
				});
			});

			new MarkerClusterer(this.oMap, aMapMarkers, {
				imagePath: "https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m",
			});
		},

		insertFlightPolyline: function () {
			var aMarkers = this.getMarkers();

			var aMapMarkers = [
				new google.maps.Marker({
					position: new google.maps.LatLng(aMarkers.FromCoordinates.lat, aMarkers.FromCoordinates.lon),
				}),
				new google.maps.Marker({
					position: new google.maps.LatLng(aMarkers.ToCoordinates.lat, aMarkers.ToCoordinates.lon),
				}),
			];

			var oLineSymbol = {
				path: "M 0,-1 0,1",
				strokeOpacity: 1,
				scale: 4,
			};

			new google.maps.Polyline({
				path: [aMapMarkers[0].getPosition(), aMapMarkers[1].getPosition()],
				geodesic: true,
				strokeColor: "#FF0000",
				strokeOpacity: 0,
				map: this.oMap,
				icons: [
					{
						icon: oLineSymbol,
						offset: "0",
						repeat: "20px",
					},
					{
						icon: {
							path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
							offset: "100%",
							fillColor: "red",
							fillOpacity: 1,
							strokeOpacity: 1,
						},
					},
				],
			});
		},
	});
});
