<div class="container">
    <div class="row">
        <div class="col-lg-12">
            <ul class="portfolio-filter text-center">
                <?php if(isset($showAll)):?>
                <li><a class="btn btn-default <?php echo $filter == 'all' ? 'active' : ''?>" href="#" data-filter="*">Todos</a></li>
                <?php endif;?>
                <?php foreach ($categories as $cat) { ?>
                    <li>
                        <a href="" class="btn btn-default <?php echo $filter == $cat['id'] ? 'active' : ''?>"
                           data-filter=".cat-<?php echo $cat['id'] ?>">
                            <?php echo $cat['name']; ?>
                        </a>
                    </li>
                <?php } ?>
            </ul>

            <div class="portfolio-items">
                <?php foreach ($portfolios as $portfolio): ?>
                    <?php $display = ''; if(!isset($showAll) && $filter != 'all'){ $display = $filter == $portfolio['catId'] ? '' : 'display: none;'; } ?>
                    <div class="portfolio-item col-xs-12 col-sm-4 col-md-3 cat-<?php echo $portfolio['catId'] ?>" style="<?php echo $display?>">
                        <div class="recent-work-wrap">
                            <img class="img-responsive"
                                 src="<?php echo ipFileUrl(ipReflection($portfolio['cover'], $imageOptions['thumb'])) ?>"
                                 alt="">
                            <div class="overlay">
                                <div class="recent-work-inner">
                                    <h3><a href="#"><?php echo $portfolio['title'] ?></a></h3>
                                    <?php echo $portfolio['description'] ?>
                                    <a class="preview" href="" rel="portfolio-gal-<?php echo $portfolio['id'] ?>">
                                        <i class="fa fa-eye"></i> Ver +</a>
                                </div>
                            </div>
                            <ul class="portfolio-gal-<?php echo $portfolio['id'] ?> hidden" style="display: none;">
                                <?php foreach ($portfolio['image'] as $i => $image): $i++ ?>
                                    <?php $url = ipFileUrl(ipReflection($image, $imageOptions['big'])); $thumb = ipFileUrl(ipReflection($image, $imageOptions['thumb'])); list($width, $height) = getimagesize( $url ); ?>
                                    <li>
                                        <a href="<?php echo $url ?>">
                                            <img src="<?php echo $thumb ?>"
                                                 data-original-src="<?php echo $url; ?>"
                                                 data-original-src-width="<?php echo $width ?>"
                                                 data-original-src-height="<?php echo $height ?>"
                                                 alt="<?php echo "{$portfolio['title']} #{$i}" ?>">
                                        </a>
                                    </li>
                                <?php endforeach; ?>
                            </ul>
                        </div>
                    </div><!--/.portfolio-item-->
                <?php endforeach; ?>
            </div>
        </div>
    </div>
</div>