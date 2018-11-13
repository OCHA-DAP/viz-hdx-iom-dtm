var Models = {
    getDataDTM: function getDataDTM() {
        url = 'https://proxy.hxlstandard.org/data/004c97/download/africa-dtm-baseline-assessments-topline.objects.json'
        $.getJSON(url, function (data) {
            var totalIdps = 0;
            var totalHH = 0;
            var countriesOld = [];
            var newArraySeries = [];
            var countries = {};

            $.each(data, function (key, val) {
                totalIdps += val["#population+idps+ind"];
                totalHH += val["#population+hh+idps"];
                countriesOld.push(val["#country+name"]);

                if (!countries[val["#country+name"]]) {
                    countries[val["#country+name"]] = 0
                }
                countries[val["#country+name"]] += val["#population+idps+ind"]
            })

            for (var country in countries) {
                newArraySeries.push({ country: country, idpsnumber: countries[country] })
            }

            $('#totalNumHH').text(Utility.abbreviateNumber(totalHH)).removeClass("spinner");
           $('#totalNumIDP').text(Utility.abbreviateNumber(totalIdps)).removeClass("spinner");

            var numOfCountries = new Set(countriesOld);

            $('#numOfCountries').text(numOfCountries.size).removeClass("spinner")

            newArraySeries.sort(Utility.dynamicSort("idpsnumber"));

            console.log(newArraySeries);

            Charts.drawIDPsByCountryChart(newArraySeries);

        }).fail(function () {
            console.log("error");
        });
    }
}