(function ($) {
    // portfolio filter
    $(window).load(function(){
        'use strict';

        var $portfolio_selectors = $('.portfolio-filter >li>a');
        var $portfolio = $('.portfolio-items');
        $portfolio.isotope({
            itemSelector : '.portfolio-item',
            layoutMode : 'fitRows'
        });

        $portfolio_selectors.each(function(){
           var $this = $(this);

           if($this.hasClass('active')){
               var selector = $this.attr('data-filter');
               $portfolio.isotope({ filter: selector });
           }
        });

        $portfolio_selectors.on('click', function(){
            $portfolio_selectors.removeClass('active');
            $(this).addClass('active');
            var selector = $(this).attr('data-filter');
            $portfolio.isotope({ filter: selector });
            return false;
        });

        if(!ipIsManagementState){
            $('.portfolio-item ul').lightGallery({
                thumbnail: true
            });
            $('.portfolio-item a').on('click', function(e){
                e.preventDefault();
                var id = $(this).attr('rel');
                $('.' + id).find('li:first a').trigger('click');

            });
        }else{
            $('.portfolio-item a').on('click', function(e){
                e.preventDefault();
            });
        }



    });
})(jQuery);