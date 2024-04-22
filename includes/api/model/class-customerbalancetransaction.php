<?php

namespace Gravity_Forms_Stripe\API\Model;

require_once( 'class-base.php' );

/**
 * Represents a Stripe Customer balance transaction.
 *
 * @since 5.5.0
 */
class CustomerBalanceTransaction extends Base {

	/**
	 * This method is not supported by this object
	 *
	 * @since 5.5.0
	 *
	 * @param $id
	 * @param $params
	 * @param $opts
	 * @return \WP_Error
	 */
	public function update( $id, $params = null, $opts = null ) {
		return new \WP_Error( 'invalid-request', __( 'Updating customer balance transactions are not supported via this object. Use GF_Stripe_API::adjust_customer_balance() instead.', 'gravityformsstripe' ) );
	}
}
