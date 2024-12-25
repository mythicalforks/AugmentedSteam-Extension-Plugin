export function createFakeHeader() {
    const wishlistLink = document.querySelector('#wishlist_link') as HTMLAnchorElement;
    const username = wishlistLink.href.match(/id\/(.+?)\//)[1];

    const pageContent = document.querySelector('.responsive_page_content');
    pageContent.innerHTML = legacyFakeHeader.replaceAll('%username%', username) + pageContent.innerHTML;
}

export const legacyFakeHeader = `
<div style="display: none;" role="banner" id="global_header" data-panel="{&quot;flow-children&quot;:&quot;row&quot;}">
	<div class="content">
		<div class="logo">
			<span id="logo_holder">
									<a href="https://store.steampowered.com/?snr=1_5_9__global-header" aria-label="Link to the Steam Homepage">
						<img src="https://store.fastly.steamstatic.com/public/shared/images/header/logo_steam.svg?t=962016" width="176" height="44" alt="Link to the Steam Homepage">
					</a>
							</span>
		</div>

			<div role="navigation" class="supernav_container" aria-label="Global Menu">
								<a class="menuitem supernav supernav_active" href="https://store.steampowered.com/?snr=1_5_9__global-header" data-tooltip-type="selector" data-tooltip-content=".submenu_Store">
				STORE			</a>
			<div class="submenu_Store" style="display: none;" data-submenuid="Store">
														<a class="submenuitem" href="https://store.steampowered.com/?snr=1_5_9__global-header">
						Home											</a>
														<a class="submenuitem" href="https://store.steampowered.com/explore/?snr=1_5_9__global-header">
						Discovery Queue											</a>
														<a class="submenuitem" href="https://steamcommunity.com/my/wishlist/">
						Wishlist											</a>
														<a class="submenuitem" href="https://store.steampowered.com/points/shop/?snr=1_5_9__global-header">
						Points Shop											</a>
														<a class="submenuitem" href="https://store.steampowered.com/news/?snr=1_5_9__global-header">
						News											</a>
														<a class="submenuitem" href="https://store.steampowered.com/stats/?snr=1_5_9__global-header">
						Stats											</a>
														<a class="submenuitem" href="https://store.steampowered.com/about/?snr=1_5_9__global-header">
						About											</a>
							</div>
										<a class="menuitem supernav" href="https://steamcommunity.com/" data-tooltip-type="selector" data-tooltip-content=".submenu_Community">
				COMMUNITY			</a>
			<div class="submenu_Community" style="display: none;" data-submenuid="Community">
														<a class="submenuitem" href="https://steamcommunity.com/">
						Home											</a>
														<a class="submenuitem" href="https://steamcommunity.com/discussions/">
						Discussions											</a>
														<a class="submenuitem" href="https://steamcommunity.com/workshop/">
						Workshop											</a>
														<a class="submenuitem" href="https://steamcommunity.com/market/">
						Market											</a>
														<a class="submenuitem" href="https://steamcommunity.com/?subsection=broadcasts">
						Broadcasts											</a>
							</div>
										<a class="menuitem supernav username" href="https://steamcommunity.com/my/" data-tooltip-type="selector" data-tooltip-content=".submenu_Profile">
				Fake user			</a>
			<div class="submenu_Profile" style="display: none;" data-submenuid="Profile">
														<a class="submenuitem" href="https://steamcommunity.com/my/home/">
						Activity											</a>
														<a class="submenuitem" href="https://steamcommunity.com/my/">
						Profile											</a>
														<a class="submenuitem" href="https://steamcommunity.com/my/friends/">
						Friends											</a>
														<a class="submenuitem" href="https://steamcommunity.com/my/games/">
						Games											</a>
														<a class="submenuitem" href="https://steamcommunity.com/my/groups/">
						Groups											</a>
														<a class="submenuitem" href="https://steamcommunity.com/my/screenshots/">
						Content											</a>
														<a class="submenuitem" href="https://steamcommunity.com/my/badges/">
						Badges											</a>
														<a class="submenuitem" href="https://steamcommunity.com/my/inventory/">
						Inventory											</a>
														<a class="submenuitem" href="https://store.steampowered.com/yearinreview/?snr=1_5_9__global-header">
						Steam Replay											</a>
							</div>
										<a class="menuitem " href="https://steamcommunity.com/chat/">
				Chat			</a>
										<a class="menuitem " href="https://help.steampowered.com/en/">
				SUPPORT			</a>
				</div>

		<div id="global_actions">
			<div role="navigation" id="global_action_menu" aria-label="Account Menu">
									<a class="header_installsteam_btn header_installsteam_btn_gray" href="https://store.steampowered.com/about/?snr=1_5_9__global-header">
						<div class="header_installsteam_btn_content">
							Install Steam						</div>
					</a>
				
				
										<!-- notification inbox area -->
																								<div id="header_notification_area" style="position:relative">
							<div data-featuretarget="green-envelope"><div><button id="green_envelope_menu_root" class="_1jW5_Ycv6jGKu28A1OSIQK _34A9kjlnmgfUWSmr16VjXE"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36" fill="none" class="_13fwmIK8Ajo0qndUS5zb7E"><g class="SVGIcon_Notification"><path fill-rule="evenodd" clip-rule="evenodd" d="M32 24V26H4V24L8 19V12C8 9.34784 9.05357 6.8043 10.9289 4.92893C12.8043 3.05357 15.3478 2 18 2C20.6522 2 23.1957 3.05357 25.0711 4.92893C26.9464 6.8043 28 9.34784 28 12V19L32 24Z" fill="currentColor"></path><path class="SVGIcon_Notification_Uvula" fill-rule="evenodd" clip-rule="evenodd" d="M18 34C19.2396 33.9986 20.4483 33.6133 21.46 32.897C22.4718 32.1807 23.2368 31.1687 23.65 30H12.35C12.7632 31.1687 13.5282 32.1807 14.54 32.897C15.5517 33.6133 16.7604 33.9986 18 34Z" fill="currentColor"></path></g></svg></button></div></div><script type="text/javascript">$J( EnableNotificationCountPolling );</script>			<div id="header_notification_link" class="header_notification_btn global_header_toggle_button header_notification_bell" style="background-color: rgba(0, 0, 0, 0);"></div>
									</div>
					<button class="pulldown global_action_link persona_name_text_content" id="account_pulldown" onclick="ShowMenu( this, 'account_dropdown', 'right', 'bottom', true );">
						Fake user					</button>
					<div class="popup_block_new" id="account_dropdown" style="display: none;">
						<div class="popup_body popup_menu">
															<a class="popup_menu_item" href="https://steamcommunity.com/id/%username%/">View my profile</a>
								<a class="popup_menu_item" href="https://store.steampowered.com/account/?snr=1_5_9__global-header">Account details: <span class="account_name">%username%</span></a>
																						<a class="popup_menu_item" href="https://store.steampowered.com/account/preferences/?snr=1_5_9__global-header">Store preferences</a>
																	<a class="popup_menu_item" href="https://store.steampowered.com/steamaccount/addfunds/?snr=1_5_9__global-header">View my wallet <span class="account_name">10,00€</span></a>
															
															<span class="popup_menu_item" id="account_language_pulldown">Change language</span>
								<div class="popup_block_new" id="language_dropdown" style="display: none;">
									<div class="popup_body popup_menu">
																																													<a class="popup_menu_item tight" href="?l=schinese" onclick="ChangeLanguage( 'schinese' ); return false;">简体中文 (Simplified Chinese)</a>
																																			<a class="popup_menu_item tight" href="?l=tchinese" onclick="ChangeLanguage( 'tchinese' ); return false;">繁體中文 (Traditional Chinese)</a>
																																			<a class="popup_menu_item tight" href="?l=japanese" onclick="ChangeLanguage( 'japanese' ); return false;">日本語 (Japanese)</a>
																																			<a class="popup_menu_item tight" href="?l=koreana" onclick="ChangeLanguage( 'koreana' ); return false;">한국어 (Korean)</a>
																																			<a class="popup_menu_item tight" href="?l=thai" onclick="ChangeLanguage( 'thai' ); return false;">ไทย (Thai)</a>
																																			<a class="popup_menu_item tight" href="?l=bulgarian" onclick="ChangeLanguage( 'bulgarian' ); return false;">Български (Bulgarian)</a>
																																			<a class="popup_menu_item tight" href="?l=czech" onclick="ChangeLanguage( 'czech' ); return false;">Čeština (Czech)</a>
																																			<a class="popup_menu_item tight" href="?l=danish" onclick="ChangeLanguage( 'danish' ); return false;">Dansk (Danish)</a>
																																			<a class="popup_menu_item tight" href="?l=german" onclick="ChangeLanguage( 'german' ); return false;">Deutsch (German)</a>
																																			<a class="popup_menu_item tight" href="?l=english" onclick="ChangeLanguage( 'english' ); return false;">English</a>
																																			<a class="popup_menu_item tight" href="?l=spanish" onclick="ChangeLanguage( 'spanish' ); return false;">Español - España (Spanish - Spain)</a>
																																			<a class="popup_menu_item tight" href="?l=latam" onclick="ChangeLanguage( 'latam' ); return false;">Español - Latinoamérica (Spanish - Latin America)</a>
																																			<a class="popup_menu_item tight" href="?l=greek" onclick="ChangeLanguage( 'greek' ); return false;">Ελληνικά (Greek)</a>
																																			<a class="popup_menu_item tight" href="?l=french" onclick="ChangeLanguage( 'french' ); return false;">Français (French)</a>
																																			<a class="popup_menu_item tight" href="?l=italian" onclick="ChangeLanguage( 'italian' ); return false;">Italiano (Italian)</a>
																																			<a class="popup_menu_item tight" href="?l=indonesian" onclick="ChangeLanguage( 'indonesian' ); return false;">Bahasa Indonesia (Indonesian)</a>
																																			<a class="popup_menu_item tight" href="?l=hungarian" onclick="ChangeLanguage( 'hungarian' ); return false;">Magyar (Hungarian)</a>
																																			<a class="popup_menu_item tight" href="?l=dutch" onclick="ChangeLanguage( 'dutch' ); return false;">Nederlands (Dutch)</a>
																																			<a class="popup_menu_item tight" href="?l=norwegian" onclick="ChangeLanguage( 'norwegian' ); return false;">Norsk (Norwegian)</a>
																																			<a class="popup_menu_item tight" href="?l=polish" onclick="ChangeLanguage( 'polish' ); return false;">Polski (Polish)</a>
																																			<a class="popup_menu_item tight" href="?l=portuguese" onclick="ChangeLanguage( 'portuguese' ); return false;">Português (Portuguese - Portugal)</a>
																																			<a class="popup_menu_item tight" href="?l=brazilian" onclick="ChangeLanguage( 'brazilian' ); return false;">Português - Brasil (Portuguese - Brazil)</a>
																																			<a class="popup_menu_item tight" href="?l=romanian" onclick="ChangeLanguage( 'romanian' ); return false;">Română (Romanian)</a>
																																			<a class="popup_menu_item tight" href="?l=russian" onclick="ChangeLanguage( 'russian' ); return false;">Русский (Russian)</a>
																																			<a class="popup_menu_item tight" href="?l=finnish" onclick="ChangeLanguage( 'finnish' ); return false;">Suomi (Finnish)</a>
																																			<a class="popup_menu_item tight" href="?l=swedish" onclick="ChangeLanguage( 'swedish' ); return false;">Svenska (Swedish)</a>
																																			<a class="popup_menu_item tight" href="?l=turkish" onclick="ChangeLanguage( 'turkish' ); return false;">Türkçe (Turkish)</a>
																																			<a class="popup_menu_item tight" href="?l=vietnamese" onclick="ChangeLanguage( 'vietnamese' ); return false;">Tiếng Việt (Vietnamese)</a>
																																			<a class="popup_menu_item tight" href="?l=ukrainian" onclick="ChangeLanguage( 'ukrainian' ); return false;">Українська (Ukrainian)</a>
																															<a class="popup_menu_item tight" href="https://www.valvesoftware.com/en/contact?contact-person=Translation%20Team%20Feedback" target="_blank">
											Report a translation problem										</a>
									</div>
								</div>
							
															<a class="popup_menu_item" href="javascript:Logout();">Sign out of account...</a>
													</div>
					</div>
					<script type="text/javascript">
						RegisterFlyout( 'account_language_pulldown', 'language_dropdown', 'leftsubmenu', 'bottomsubmenu', true );
					</script>
											<div id="header_wallet_ctn">
							<a class="global_action_link" id="header_wallet_balance" href="https://store.steampowered.com/account/store_transactions/">10,00€</a>
						</div>
												</div>
							<a href="https://steamcommunity.com/id/%username%/" class="user_avatar playerAvatar online" aria-label="View your profile">
					<img src="https://avatars.fastly.steamstatic.com/faky.jpg" alt="fake user">
				</a>
					</div>
			</div>
</div>
`