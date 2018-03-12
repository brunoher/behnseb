//Filter epochToDate :
//Use for convert epoch date format to default date format.
//Example :
//<p>{{item.createdAt |epochToDate | date:"short"}}</p>
appControllers.filter('epochToDate', function ($filter) {
    return function (input) {
        return new Date(Date(input));
    };
});// End Filter epochToDate.

//Filter numberSuffix :
//Use for convert number to have suffix 1,000 to 1K.
//Example :
//{{item.likes.summary.total_count | numberSuffix}}
//
appControllers.filter('numberSuffix', function () {
    return function (input) {
        var exp;
        var suffixes = ['k', 'M', 'G', 'T', 'P', 'E'];

        if (window.isNaN(input)) {
            return 0;
        }

        if (input < 1000) {
            return input;
        }

        exp = Math.floor(Math.log(input) / Math.log(1000));

        return (input / Math.pow(1000, exp)).toFixed(1) + suffixes[exp - 1];
    }
});// End Filter numberSuffix.


appControllers.filter('firstChar', function(){
	return function(string){
		if(angular.isDefined(string) && string != '' && string != null) return string.substring(0,1).toUpperCase();
	};
})

.filter('sinceTime', function($filter){
	return function(time){
		time = Number(time);
		if(angular.isDefined(time) && angular.isNumber(time)) {
			var now = new Date().getTime();
			var since = now - time;
			if(since > 432000000){
				return $filter('date')(time,'dd/MM/yyyy');
			} else {
				if(since < 120000) return "A l'instant";
				else {
					if(since < 3600000) return $filter('date')(since,'mm')+' minutes';
					else if(since < 86400000) return Math.floor(since/1000/60/60)+' heures';
					else return $filter('date')(since,'dd')+' jours';
				}
			}
		}
	};
})

.filter('isEmpty', function () {
	var bar;
	return function (obj) {
		for (bar in obj) {
			if (obj.hasOwnProperty(bar)) {
				return false;
			}
		}
		return true;
	};
})
